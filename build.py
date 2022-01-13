#!/usr/bin/env python3
# pylint: disable=C0103
import os
import shutil
import configparser
import xml.etree.ElementTree as ET

pj = os.path.join
pn = os.path.normpath

script_path = os.path.dirname(os.path.realpath(__file__))
main_path = script_path
temp_path = pj(main_path, "src_temp")

if os.path.exists(temp_path):
    shutil.rmtree(temp_path)

os.chdir(main_path)

shutil.copytree(pn("./src"), temp_path)
shutil.copy(pn("./LICENSE"), temp_path)

os.chdir(temp_path)

# Add info about locales and version to manifest files
rdfRoot = ET.parse(pn("./install.rdf")).getroot()
emRdf = "http://www.mozilla.org/2004/em-rdf#"
namespaces = {'xmlns': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
              'xmlns:em': emRdf}
for description in rdfRoot.findall('xmlns:Description', namespaces):
    extContr = description.get("{"+emRdf+"}contributor")
    extVersion = description.get("{"+emRdf+"}version")

locales_dir = pn("./chrome/locale")
localized = ''
pos = 0
for locale in sorted(os.listdir(locales_dir)):
    if not os.path.isfile(pj(locales_dir, locale)):
        pos += 1
        config = configparser.ConfigParser()
        with open(pj(locales_dir, locale, "meta.properties"), "r", encoding='utf-8') as m_f:
            config.read_string('[global]\n' + m_f.read())
        config = config["global"]
        extName = config["name"]
        extDesc = config["description"]
        extTrans = config["translator"]
        if pos != 1:
            localized += "\n\n"
        localized += f'''\
    <em:localized>
        <Description
            em:locale="{locale}"
            em:name="{extName}"
            em:description="{extDesc}"
            em:translator="{extTrans}"
            em:contributor="{extContr}"/>
    </em:localized>\
'''
        with open(pn("./locales.manifest"), "a", encoding='utf-8') as l_m:
            if locale != "en-US":
                l_m.write("locale status4evar "+locale +
                          " chrome/locale/"+locale+"/\n")

install_file = pn("./install.rdf")
with open(install_file, 'r', encoding='utf-8') as install_f:
    data = install_f.read()
    data = data.replace("_localized_", localized)
with open(install_file, 'w', encoding='utf-8') as install_f:
    install_f.write(data)

# Remove xcf icon
xcfIcon = pn(".chrome/skin/all/extIcon.xcf")
if os.path.exists(xcfIcon):
    os.remove(xcfIcon)

# Create xpi
artifacts_path = pj(main_path, "artifacts")
f_name = "S4E_Revived-"+extVersion
UXP_xpi = pj(artifacts_path, f_name + ".xpi")
if os.path.exists(UXP_xpi):
    os.remove(UXP_xpi)
if not os.path.exists(artifacts_path):
    os.makedirs(artifacts_path)
shutil.make_archive(pj(artifacts_path, f_name), 'zip', "./")
os.rename(pj(artifacts_path, f_name + ".zip"), UXP_xpi)

# Cleanup
os.chdir(main_path)
shutil.rmtree(temp_path)
