"""Build the local full-game Wine overlay from the corrected OFL UmiVN fonts.

Adds ordinary installer paths and Win32 dialog fonts.
Output stays local; no host installation or original community fonts included.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from fontTools.ttLib import TTFont
from io import BytesIO
import ast
import re
import struct

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'local-game/vn-native-fonts.css'
PREFIX = 'home/username/.wine/'


def build():
    with ZipFile(ROOT / 'assets/vn-wine-overlay.css') as source:
        with ZipFile(OUTPUT, 'w', ZIP_DEFLATED) as target:
            for info in source.infolist():
                data = source.read(info.filename)
                if info.filename == PREFIX + 'user.reg':
                    # Wine 1.7.55 MessageBox uses NONCLIENTMETRICS.MessageFont.
                    # Set its original face explicitly: substitution can still
                    # select the existing bitmap family before the substitute.
                    section = b'[Control Panel\\\\Desktop\\\\WindowMetrics]'
                    start = data.index(section)
                    end = data.find(b'\n[', start + len(section))
                    if end < 0:
                        end = len(data)
                    block = data[start:end]
                    for key in ('MessageFont', 'CaptionFont', 'SmCaptionFont',
                                'MenuFont', 'StatusFont'):
                        weight = 700 if key == 'CaptionFont' else 400
                        face = 'UmiVN'.encode('utf-16le').ljust(64, b'\0')
                        logfont = struct.pack('<5i8B', -12, 0, 0, 0, weight,
                                              0, 0, 0, 0, 0, 0, 0, 0) + face
                        assert len(logfont) == 92
                        block = re.sub(rb'^"' + key.encode() + rb'"=.*$',
                                       b'', block, flags=re.MULTILINE)
                        block += ('\n"' + key + '"=hex:' +
                                  ','.join(f'{byte:02x}' for byte in logfont) + '\n').encode()
                    data = data[:start] + block + data[end:]
                if info.filename == PREFIX + 'system.reg':
                    # Win32 message boxes use dialog/system faces, independently
                    # of the game's font-name string resources. Keep their TCVN3
                    # strings readable inside this game-only Wine prefix.
                    section = b'[Software\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\FontSubstitutes]'
                    start = data.index(section)
                    end = data.find(b'\n[', start + len(section))
                    if end < 0:
                        end = len(data)
                    block = data[start:end]
                    faces = ('MS Shell Dlg', 'MS Shell Dlg 2', 'MS Sans Serif',
                             'Microsoft Sans Serif', 'Arial', 'Tahoma', 'System')
                    for face in faces:
                        pattern = rb'^"' + re.escape(face.encode('ascii')) + rb'"=.*$'
                        block = re.sub(pattern, b'', block, flags=re.MULTILINE)
                        block += ('\n"' + face + '"="UmiVN"\n').encode('ascii')
                    data = data[:start] + block + data[end:]
                    # Normal installer-discovery paths from AOESETUP resources.
                    # These locate the supplied base/expansion files only.
                    data += (
                        '\n[Software\\\\Microsoft\\\\Games\\\\Age of Empires\\\\1.00]\n'
                        '"InstallationDirectory"="D:\\\\userapp"\n'
                        '"Version"="1.0b"\n'
                        '"CDPath"="E:\\\\"\n'
                        '\n[Software\\\\Microsoft\\\\Microsoft Games\\\\Age of Empires Expansion\\\\1.0]\n'
                        '"EXE Path"="D:\\\\userapp"\n'
                        '"CDPath"="E:\\\\"\n'
                        '\n[Software\\\\Wine\\\\Drives]\n'
                        '"e:"="cdrom"\n'
                    ).encode('ascii')
                target.writestr(info, data)
            # The launcher mounts the supplied original CD files here.
            target.writestr(PREFIX + 'dosdevices/e(_colon_).link', '/mnt/cdrom')
    with ZipFile(OUTPUT) as checked:
        registry = checked.read(PREFIX + 'system.reg')
        assert b'"MessageFont"=hex:' in checked.read(PREFIX + 'user.reg')
        assert b'"MS Shell Dlg"="UmiVN"' in registry
        assert b'"MS Sans Serif"="UmiVN"' in registry
        assert b'"InstallationDirectory"="D:\\\\userapp"' in registry
        assert b'"EXE Path"="D:\\\\userapp"' in registry
        assert registry.count(b'"CDPath"="E:\\\\"') == 2
        assert b'"e:"="cdrom"' in registry
        assert checked.read(PREFIX + 'dosdevices/e(_colon_).link') == b'/mnt/cdrom'
        # Compare every serialized cmap against unmodified OFL source glyphs.
        parsed = ast.parse((ROOT / 'scripts/build-vn-overlay.py').read_text(encoding='utf-8'))
        mapping = {node.targets[0].id: ast.literal_eval(node.value)
                   for node in parsed.body if isinstance(node, ast.Assign)
                   and isinstance(node.targets[0], ast.Name)
                   and node.targets[0].id in ('old', 'new')}
        with ZipFile(ROOT / 'fs/wine1.7.55-v8-min-online.zip') as original:
            for name in checked.namelist():
                if not name.endswith(('LiberationSans-Regular.ttf', 'LiberationSans-Bold.ttf')):
                    continue
                base = TTFont(BytesIO(original.read(name))).getBestCmap().copy()
                font = TTFont(BytesIO(checked.read(name)))
                for table in font['cmap'].tables:
                    if table.isUnicode():
                        for before, after in zip(mapping['old'], mapping['new']):
                            assert table.cmap.get(ord(before)) == base[ord(after)]
        message = re.search(rb'"MessageFont"=hex:([^\n]+)', checked.read(PREFIX + 'user.reg'))
        logfont = bytes.fromhex(message[1].decode().replace(',', ''))
        assert len(logfont) == 92 and logfont[28:].decode('utf-16le').rstrip('\0') == 'UmiVN'
    print('Built local-only overlay:', OUTPUT, OUTPUT.stat().st_size, 'bytes')
    print('Verified both OFL font cmaps and Win32 MessageFont UmiVN; no host font installation.')


if __name__ == '__main__':
    build()
