"""Build a lightweight Wine overlay with OFL fonts renamed UmiVN Sans.
Source: original Boxedwine Wine 1.7.55 overlay, not any paid/community fonts.
Two font faces have their CP1252 glyphs remapped for TCVN3 game text.
"""
from zipfile import ZipFile,ZIP_DEFLATED
from fontTools.ttLib import TTFont
from io import BytesIO
from pathlib import Path
root=Path(__file__).resolve().parent.parent
src=root/'fs/wine1.7.55-v8-min-online.zip'
dst=root/'assets/vn-wine-overlay.css'
old="µ¸¶·¹¨»¾¼½Æ©ÇÊÈÉË®ÌÐÎÏÑªÒÕÓÔÖ×ÝØÜÞßãáâä«åèæçé¬êíëìîïóñòô\xadõøö÷ùúýûüþ¡¢§£¤¥¦"
new="àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵĂÂĐÊÔƠƯ"
assert len(old)==len(new)
dst.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(src) as inp,ZipFile(dst,'w',compression=ZIP_DEFLATED,compresslevel=6,allowZip64=True) as out:
 for info in inp.infolist():
  data=inp.read(info.filename)
  if info.filename.endswith(('LiberationSans-Regular.ttf','LiberationSans-Bold.ttf')):
   font=TTFont(BytesIO(data))
   base=font.getBestCmap()
   for table in font['cmap'].tables:
    if table.isUnicode():
     for before,after in zip(old,new):
      if ord(before)>127 and ord(after) in base:
       table.cmap[ord(before)]=base[ord(after)]
   # Liberation is a reserved name in the SIL OFL.
   for name in font['name'].names:
    if name.nameID in (1,3,4,6,16,17):
     decoded=name.toUnicode()
     renamed=decoded.replace('Liberation Sans','UmiVN').replace('LiberationSans','UmiVN')
     if renamed!=decoded:
      name.string=renamed.encode(name.getEncoding(),errors='replace')
   buf=BytesIO();font.save(buf)
   data=buf.getvalue()
   print('Font renamed, TCVN3 glyphs corrected:',info.filename,len(data))
  if info.filename=='home/username/.wine/system.reg':
   marker=b'"Arial (TrueType)"="Arial.TTF"'
   assert marker in data
   data=data.replace(marker,marker+b'\n"UmiVN (TrueType)"="UmiVN.TTF"\n"UmiVN Bold (TrueType)"="UmiVNBD.TTF"',1)
  out.writestr(info,data)
 out.writestr('home/username/.wine/drive_c/windows/Fonts/UmiVN.TTF.link','RedHat/LiberationSans-Regular.ttf')
 out.writestr('home/username/.wine/drive_c/windows/Fonts/UmiVNBD.TTF.link','RedHat/LiberationSans-Bold.ttf')
print('Optimized overlay bytes:',dst.stat().st_size)
