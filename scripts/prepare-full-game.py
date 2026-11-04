"""Package an existing local Rise of Rome folder; never download or publish game data.

Default source: original uploader https://nphunghung.com/download-game-de-che-1-aoe-1/
Translation source: aoe.vn article 5752. Availability does not grant redistribution.
Requires already-installed pefile to check local extension DLL dependencies.
"""
import argparse
import hashlib
import json
import re
import struct
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import pefile

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=ROOT / 'local-game/aoe-nphunghung/game-staging')
parser.add_argument('--source-url', default='https://nphunghung.com/download-game-de-che-1-aoe-1/')
parser.add_argument('--translation', type=Path, default=ROOT / 'local-game/aoe-vi/AOE Viet Hoa - Font VnArial')
parser.add_argument('--output', type=Path, default=ROOT / 'local-game/aoe-standard-web')
parser.add_argument('--overlay', type=Path, default=ROOT / 'local-game/vn-native-fonts.css')
parser.add_argument('--cd-root', type=Path, help='Optional extracted original Gold CD (volume AOE); local use only')
args = parser.parse_args()
files = {p.name.lower(): p for p in args.source.iterdir() if p.is_file()}
exe = files['empiresx.exe']
base_exe = files['empires.exe']
exe_hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (exe, base_exe)}
imports = {entry.dll.decode('ascii').lower() for entry in pefile.PE(str(exe)).DIRECTORY_ENTRY_IMPORT}
# DDRAW is a Windows API provided by Wine; omit the supplied override DLL.
optional = {'ddraw.dll', 'd3dhook.dll', 'service.dll', 'exwe.dll'}
required_extensions = imports & {'service.dll', 'exwe.dll', 'd3dhook.dll'}
excluded = optional - required_extensions
excluded |= {name for name in files if name.endswith('.exe') and name not in (exe.name.lower(), 'empires.exe')}
translations = {p.name.lower(): p for p in args.translation.iterdir() if p.is_file()}
for name in ('language.dll', 'languagex.dll'):
    if name not in translations:
        raise FileNotFoundError(f'Missing original community translation: {name}')
args.output.mkdir(parents=True, exist_ok=True)
archive = args.output / 'aoe-full.zip'
translation_hashes = {}

def wine_language(data):
    """Keep TCVN3 text; use the verified Unicode cmap in the UmiVN font."""
    pe = pefile.PE(data=data)
    for kind in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        if kind.id != 6:
            continue
        for block in kind.directory.entries:
            for language in block.directory.entries:
                resource = language.data.struct
                source = pe.get_data(resource.OffsetToData, resource.Size)
                position, chunks = 0, []
                for _ in range(16):
                    length = struct.unpack_from('<H', source, position)[0]
                    position += 2
                    value = source[position:position + length * 2].decode('utf-16le')
                    position += length * 2
                    if value.lower().startswith('.vn') and 'arial' in value.lower():
                        value = 'UmiVN'
                    encoded = value.encode('utf-16le')
                    chunks.append(struct.pack('<H', len(value)) + encoded)
                updated = b''.join(chunks)
                assert len(updated) <= resource.Size
                pe.set_bytes_at_offset(pe.get_offset_from_rva(resource.OffsetToData),
                                       updated + bytes(resource.Size - len(updated)))
    return pe.write()

with ZipFile(archive, 'w', compression=ZIP_DEFLATED, compresslevel=6) as out:
    for path in sorted(args.source.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(args.source)
        if len(relative.parts) > 1 and path.suffix.lower() == '.exe':
            continue
        # Shared downloads can contain somebody else's saved games/progress.
        # Omit only from the package; preserve all original/staging source files.
        if path.suffix.lower() in ('.gam', '.gmx') or re.fullmatch(r'game\d+\.nfo', path.name, re.IGNORECASE):
            continue
        if len(relative.parts) == 1 and path.name.lower() in excluded:
            continue
        if len(relative.parts) == 1 and path.name.lower() in ('language.dll', 'languagex.dll'):
            continue
        data = path.read_bytes()
        target = 'userapp/' + relative.as_posix()
        out.writestr(target, data)
    save_dir = next((p.name for p in args.source.iterdir() if p.is_dir() and p.name.lower() == 'savegame'), 'SAVEGAME')
    out.writestr('userapp/' + save_dir + '/', b'')
    # Expansion media may call this LANGUA_1.DLL; installed games need languagex.dll.
    for name in ('language.dll', 'languagex.dll'):
        data = wine_language(translations[name].read_bytes())
        target = 'userapp/' + name
        out.writestr(target, data)
        translation_hashes[target] = hashlib.sha256(data).hexdigest()
    if args.overlay.is_file():
        overlay = args.overlay.read_bytes()
        with ZipFile(args.overlay) as fonts:
            assert fonts.testzip() is None, 'Invalid native-font overlay ZIP'
        out.writestr('web/wine-overlay.zip', overlay)
        out.writestr('web/game.json', json.dumps({
            'edition': 'full', 'exe': exe.name, 'overlayEntry': 'web/wine-overlay.zip',
            'source': args.source_url, 'exeSha256': exe_hashes[exe.name],
            **({'cdRoot': 'cdrom'} if args.cd_root else {}),
        }))
    if args.cd_root:
        if not args.cd_root.is_dir():
            raise FileNotFoundError(args.cd_root)
        for path in sorted(args.cd_root.rglob('*')):
            if path.is_file():
                # Preserve original CD data, omitting any saved progress if present.
                if path.suffix.lower() in ('.gam', '.gmx') or re.fullmatch(r'game\d+\.nfo', path.name, re.IGNORECASE):
                    continue
                out.write(path, 'cdrom/' + path.relative_to(args.cd_root).as_posix())
        # Verified from the source Gold ISO primary volume descriptor.
        out.writestr('cdrom/.windows-label', 'AOE\n')

# Validate output, including unchanged game executables and adapted translations.
with ZipFile(archive) as check:
    names = {name.lower() for name in check.namelist()}
    assert 'userapp/' + exe.name.lower() in names
    assert 'userapp/empires.exe' in names
    for name, expected in exe_hashes.items():
        assert hashlib.sha256(check.read('userapp/' + name)).hexdigest() == expected
    assert 'userapp/data/empires.dat' in names
    assert 'userapp/data2/empires.dat' in names
    assert not any(name.endswith(('.gam', '.gmx')) or re.fullmatch(r'game\d+\.nfo', name.rsplit('/', 1)[-1]) for name in names)
    assert 'userapp/' + save_dir.lower() + '/' in names
    for directory in ('data', 'data2'):
        folder = next(p for p in args.source.iterdir() if p.is_dir() and p.name.lower() == directory)
        data_file = next(p for p in folder.iterdir() if p.name.lower() == 'empires.dat')
        member = next(name for name in check.namelist() if name.lower() == f'userapp/{directory}/empires.dat')
        assert hashlib.sha256(check.read(member)).digest() == hashlib.sha256(data_file.read_bytes()).digest()
    assert len(translation_hashes) == 2
    for name, expected in translation_hashes.items():
        assert hashlib.sha256(check.read(name)).hexdigest() == expected
    for name in excluded:
        assert 'userapp/' + name not in names
    if args.cd_root:
        assert check.read('cdrom/.windows-label') == b'AOE\n'
        assert 'cdrom/aoex.ico' in names

config = {
    'edition': 'full', 'title': 'Đế Chế - Rise of Rome',
    'game': 'game/aoe-full.css', 'overlay': 'game/vn-fonts.css', 'exe': exe.name,
    'source': args.source_url, 'exeSha256': exe_hashes[exe.name],
    **({'cdRoot': 'cdrom'} if args.cd_root else {}),
}
(args.output / 'game-config.json').write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Required local extension DLLs:', ', '.join(sorted(required_extensions)) or 'none')
print('Excluded root files:', ', '.join(sorted(excluded)))
print('Archive:', archive)
print('Bytes:', archive.stat().st_size)
print('SHA256:', hashlib.sha256(archive.read_bytes()).hexdigest())
print('Adapted translation SHA256:', json.dumps(translation_hashes))
