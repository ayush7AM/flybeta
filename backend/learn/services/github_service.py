"""
Fetches source files from a public GitHub repository for capstone grading.

Walks the whole repository tree (not just the root), skips dependency and
build folders, and caps file count, file size and total size so a large or
slow repository can't stall the request.
"""
import json
import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import PurePosixPath
from urllib.parse import quote

import requests
from django.conf import settings

API_ROOT = 'https://api.github.com'
RAW_ROOT = 'https://raw.githubusercontent.com'
TIMEOUT_SECONDS = 10

MAX_FILES = 40
MAX_FILE_BYTES = 100_000
MAX_NOTEBOOK_BYTES = 1_000_000  # notebooks are mostly outputs; only cell sources are kept
MAX_TOTAL_CHARS = 200_000

SOURCE_EXTENSIONS = (
    '.py', '.ipynb', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.r', '.sql', '.sh',
    '.html', '.css', '.md', '.json', '.yml', '.yaml', '.tf', '.toml', '.cfg',
)
SOURCE_FILENAMES = {'Dockerfile', 'Makefile', 'Procfile', 'requirements.txt'}
SKIPPED_FILENAMES = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock'}
SKIPPED_DIRS = {
    'node_modules', 'venv', '.venv', 'env', '__pycache__', '.git', 'dist', 'build',
    '.next', 'vendor', 'site-packages', '.ipynb_checkpoints',
}

REPO_URL_RE = re.compile(
    r'^https?://(?:www\.)?github\.com/([A-Za-z0-9-]+)/([A-Za-z0-9._-]+?)(?:\.git)?(?:/.*)?$'
)


class RepoFetchError(Exception):
    """A problem the student can fix (bad URL, private/empty repo, no code)."""


def parse_repo_url(repo_url):
    """Return (owner, repo) for a github.com repository URL, or raise RepoFetchError."""
    match = REPO_URL_RE.match((repo_url or '').strip())
    if not match or match.group(2) in ('.', '..'):
        raise RepoFetchError(
            'Invalid GitHub URL. Please provide a URL like https://github.com/owner/repo'
        )
    return match.group(1), match.group(2)


def _is_source_file(item):
    path = PurePosixPath(item['path'])
    if item['type'] != 'blob' or path.name in SKIPPED_FILENAMES:
        return False
    if any(part in SKIPPED_DIRS for part in path.parts[:-1]):
        return False
    if path.suffix == '.ipynb':
        return item.get('size', 0) <= MAX_NOTEBOOK_BYTES
    if item.get('size', 0) > MAX_FILE_BYTES:
        return False
    return path.name in SOURCE_FILENAMES or path.suffix.lower() in SOURCE_EXTENSIONS


def _notebook_source(text):
    """Keep only the cell sources of a Jupyter notebook (drops outputs and images)."""
    try:
        cells = json.loads(text).get('cells', [])
    except (ValueError, AttributeError):
        return text
    return '\n\n'.join(''.join(cell.get('source', [])) for cell in cells)


def _fetch_file(owner, repo, path):
    response = requests.get(
        f'{RAW_ROOT}/{owner}/{repo}/HEAD/{quote(path)}',
        timeout=TIMEOUT_SECONDS,
    )
    if response.status_code != 200:
        return path, None
    text = response.text
    return path, _notebook_source(text) if path.endswith('.ipynb') else text


def fetch_github_repo_content(repo_url):
    """
    Return the repository's source files concatenated into one string.
    Raises RepoFetchError for student-fixable problems; network failures and
    GitHub outages propagate as requests exceptions / RuntimeError.
    """
    owner, repo = parse_repo_url(repo_url)

    headers = {'Accept': 'application/vnd.github+json'}
    if getattr(settings, 'GITHUB_TOKEN', None):
        headers['Authorization'] = f'Bearer {settings.GITHUB_TOKEN}'

    response = requests.get(
        f'{API_ROOT}/repos/{owner}/{repo}/git/trees/HEAD',
        params={'recursive': '1'},
        headers=headers,
        timeout=TIMEOUT_SECONDS,
    )
    if response.status_code == 404:
        raise RepoFetchError('Repository not found. Make sure it exists and is public.')
    if response.status_code == 409:
        raise RepoFetchError('This repository is empty. Push your code and try again.')
    if response.status_code != 200:
        raise RuntimeError(f'GitHub API returned {response.status_code} for {owner}/{repo}')

    # Top-level files first, so READMEs and entry points survive the file cap
    candidates = sorted(
        (item['path'] for item in response.json().get('tree', []) if _is_source_file(item)),
        key=lambda path: (path.count('/'), path.lower()),
    )[:MAX_FILES]
    if not candidates:
        raise RepoFetchError(
            'No source files found in this repository. Make sure your code is pushed.'
        )

    with ThreadPoolExecutor(max_workers=8) as pool:
        files = list(pool.map(lambda path: _fetch_file(owner, repo, path), candidates))

    sections = []
    total = 0
    for path, text in files:
        if text is None:
            continue
        section = f"\n\n{'=' * 40}\nFILE: {path}\n{'=' * 40}\n\n{text}"
        if total + len(section) > MAX_TOTAL_CHARS:
            sections.append(section[:MAX_TOTAL_CHARS - total])
            sections.append('\n\n[Truncated — repository exceeds the review size limit.]')
            break
        sections.append(section)
        total += len(section)

    if not sections:
        raise RuntimeError(f'Could not download any files from {owner}/{repo}')
    return ''.join(sections)
