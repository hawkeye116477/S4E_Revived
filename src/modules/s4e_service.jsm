/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2010-2015 Matthew Turnbull <sparky@bluefang-logic.com>. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK *****
*/

"use strict";

// Component constants
const CC = Components.classes;
const CI = Components.interfaces;
const CU = Components.utils;

CU.import("resource://gre/modules/XPCOMUtils.jsm");
CU.import("resource://gre/modules/Services.jsm");

const CURRENT_MIGRATION = 7;

const EXPORTED_SYMBOLS = ["s4e_service"];

function Status_4_Evar() {
    this.startup();
}

Status_4_Evar.prototype = {
    QueryInterface: XPCOMUtils.generateQI([
        CI.nsISupportsWeakReference,
        CI.nsIObserver,
        CI.nsIStatus4Evar
    ]),

    prefs: null,

    addonbarBorderStyle: false,
    addonbarLegacyShim: true,
    addonbarWindowGripper: true,

    advancedStatusDetectFullScreen: true,
    advancedStatusDetectVideo: true,
    advancedUrlbarForceBinding: false,

    downloadButtonAction: 1,
    downloadButtonActionCommand: "",
    downloadColorActive: null,
    downloadColorPaused: null,
    downloadForce: false,
    downloadLabel: 0,
    downloadLabelForce: true,
    downloadNotifyAnimate: true,
    downloadNotifyTimeout: 60000,
    downloadProgress: 1,
    downloadTooltip: 1,

    firstRun: true,
    firstRunAustralis: true,

    progressToolbarCSS: null,
    progressToolbarForce: false,
    progressToolbarStyle: false,

    progressUrlbar: 1,
    progressUrlbarCSS: null,
    progressUrlbarStyle: true,

    status: 1,
    statusDefault: true,
    statusNetwork: true,
    statusTimeout: 10000,
    statusLinkOver: 1,
    statusLinkOverDelayShow: 70,
    statusLinkOverDelayHide: 150,

    statusToolbarMaxLength: 0,

    statusUrlbarAlign: null,
    statusUrlbarColor: null,
    statusUrlbarPosition: 33,

    statusUrlbarInvertMirror: false,
    statusUrlbarMouseMirror: true,

    pref_registry:
    {
        "addonbar.borderStyle":
        {
            update: function () {
                this.addonbarBorderStyle = this.prefs.getBoolPref("addonbar.borderStyle");
            },
            updateWindow: function (win) {
                let browser_bottom_box = win.hawkeye116477.status4evar.getters.browserBottomBox;
                if (browser_bottom_box) {
                    this.setBoolElementAttribute(browser_bottom_box, "s4eboarder", this.addonbarBorderStyle);
                }
            }
        },

        "addonbar.legacyShim":
        {
            update: function () {
                this.addonbarLegacyShim = this.prefs.getBoolPref("addonbar.legacyShim");

                CU.import("resource://status4evar/Australis.jsm", {}).AustralisTools.updateLegacyShim(this.addonbarLegacyShim);
            }
        },

        "addonbar.windowGripper":
        {
            update: function () {
                this.addonbarWindowGripper = this.prefs.getBoolPref("addonbar.windowGripper");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.toolbars.updateWindowGripper(true);
            }
        },

        "advanced.status.detectFullScreen":
        {
            update: function () {
                this.advancedStatusDetectFullScreen = this.prefs.getBoolPref("advanced.status.detectFullScreen");
            }
        },

        "advanced.status.detectVideo":
        {
            update: function () {
                this.advancedStatusDetectVideo = this.prefs.getBoolPref("advanced.status.detectVideo");
            }
        },

        "advanced.urlbar.forceBinding":
        {
            update: function () {
                this.advancedUrlbarForceBinding = this.prefs.getBoolPref("advanced.urlbar.forceBinding");
            },
            updateWindow: function (win) {
                let urlbar = win.hawkeye116477.status4evar.getters.urlbar;
                if (urlbar) {
                    this.setBoolElementAttribute(urlbar, "s4eforce", this.advancedUrlbarForceBinding);
                }
            }
        },

        "download.button.action":
        {
            update: function () {
                this.downloadButtonAction = this.prefs.getIntPref("download.button.action");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.downloadStatus.updateBinding();
            }
        },

        "download.button.action.command":
        {
            update: function () {
                this.downloadButtonActionCommand = this.prefs.getCharPref("download.button.action.command");
            }
        },

        "download.color.active":
        {
            update: function () {
                this.downloadColorActive = this.prefs.getCharPref("download.color.active");
            },
            updateDynamicStyle: function (sheet) {
                sheet.cssRules[4].style.backgroundColor = this.downloadColorActive;
            }
        },

        "download.color.paused":
        {
            update: function () {
                this.downloadColorPaused = this.prefs.getCharPref("download.color.paused");
            },
            updateDynamicStyle: function (sheet) {
                sheet.cssRules[5].style.backgroundColor = this.downloadColorPaused;
            }
        },

        "download.force":
        {
            update: function () {
                this.downloadForce = this.prefs.getBoolPref("download.force");
            },
            updateWindow: function (win) {
                let download_button = win.hawkeye116477.status4evar.getters.downloadButton;
                if (download_button) {
                    this.setBoolElementAttribute(download_button, "forcevisible", this.downloadForce);
                }
            }
        },

        "download.label":
        {
            update: function () {
                this.downloadLabel = this.prefs.getIntPref("download.label");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.downloadStatus.updateButton();
            }
        },

        "download.label.force":
        {
            update: function () {
                this.downloadLabelForce = this.prefs.getBoolPref("download.label.force");
            },
            updateWindow: function (win) {
                let download_button = win.hawkeye116477.status4evar.getters.downloadButton;
                if (download_button) {
                    this.setBoolElementAttribute(download_button, "forcelabel", this.downloadLabelForce);
                }
            }
        },

        "download.notify.animate":
        {
            update: function () {
                this.downloadNotifyAnimate = this.prefs.getBoolPref("download.notify.animate");
            }
        },

        "download.notify.timeout":
        {
            update: function () {
                this.downloadNotifyTimeout = (this.prefs.getIntPref("download.notify.timeout") * 1000);
            }
        },

        "download.progress":
        {
            update: function () {
                this.downloadProgress = this.prefs.getIntPref("download.progress");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.downloadStatus.updateButton();
            }
        },

        "download.tooltip":
        {
            update: function () {
                this.downloadTooltip = this.prefs.getIntPref("download.tooltip");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.downloadStatus.updateButton();
            }
        },

        "progress.toolbar.css":
        {
            update: function () {
                this.progressToolbarCSS = this.prefs.getCharPref("progress.toolbar.css");
            },
            updateDynamicStyle: function (sheet) {
                sheet.cssRules[2].style.background = this.progressToolbarCSS;
            }
        },

        "progress.toolbar.force":
        {
            update: function () {
                this.progressToolbarForce = this.prefs.getBoolPref("progress.toolbar.force");
            },
            updateWindow: function (win) {
                let toolbar_progress = win.hawkeye116477.status4evar.getters.toolbarProgress;
                if (toolbar_progress) {
                    this.setBoolElementAttribute(toolbar_progress, "forcevisible", this.progressToolbarForce);
                }
            }
        },

        "progress.toolbar.style":
        {
            update: function () {
                this.progressToolbarStyle = this.prefs.getBoolPref("progress.toolbar.style");
            },
            updateWindow: function (win) {
                let toolbar_progress = win.hawkeye116477.status4evar.getters.toolbarProgress;
                if (toolbar_progress) {
                    this.setBoolElementAttribute(toolbar_progress, "s4estyle", this.progressToolbarStyle);
                }
            }
        },

        "progress.urlbar":
        {
            update: function () {
                switch (this.prefs.getIntPref("progress.urlbar")) {
                    case 0:
                        this.progressUrlbar = null;
                        break;
                    case 1:
                        this.progressUrlbar = "end";
                        break;
                    case 2:
                        this.progressUrlbar = "begin";
                        break;
                    default:
                        this.progressUrlbar = "center";
                        break;
                }
            },
            updateWindow: function (win) {
                let urlbar = win.hawkeye116477.status4evar.getters.urlbar;
                let urlbar_progress = win.hawkeye116477.status4evar.getters.urlbarProgress;
                if (urlbar && urlbar_progress) {
                    if (this.progressUrlbar) {
                        urlbar.pmpack = this.progressUrlbar;
                    }
                    urlbar_progress.hidden = !this.progressUrlbar;
                }
            }
        },

        "progress.urlbar.css":
        {
            update: function () {
                this.progressUrlbarCSS = this.prefs.getCharPref("progress.urlbar.css");
            },
            updateDynamicStyle: function (sheet) {
                sheet.cssRules[1].style.background = this.progressUrlbarCSS;
            }
        },

        "progress.urlbar.style":
        {
            update: function () {
                this.progressUrlbarStyle = this.prefs.getBoolPref("progress.urlbar.style");
            },
            updateWindow: function (win) {
                let urlbar = win.hawkeye116477.status4evar.getters.urlbar;
                if (urlbar) {
                    this.setBoolElementAttribute(urlbar, "s4estyle", this.progressUrlbarStyle);
                }
            }
        },

        "status":
        {
            update: function () {
                this.status = this.prefs.getIntPref("status");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.statusService.clearStatusField();
                win.hawkeye116477.status4evar.statusService.updateStatusField(true);
            }
        },

        "status.default":
        {
            update: function () {
                this.statusDefault = this.prefs.getBoolPref("status.default");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.statusService.buildTextOrder();
                win.hawkeye116477.status4evar.statusService.updateStatusField(true);
            }
        },

        "status.linkOver":
        {
            update: function () {
                this.statusLinkOver = this.prefs.getIntPref("status.linkOver");
            }
        },

        "status.linkOver.delay.show":
        {
            update: function () {
                this.statusLinkOverDelayShow = this.prefs.getIntPref("status.linkOver.delay.show");
            }
        },

        "status.linkOver.delay.hide":
        {
            update: function () {
                this.statusLinkOverDelayHide = this.prefs.getIntPref("status.linkOver.delay.hide");
            }
        },

        "status.network":
        {
            update: function () {
                this.statusNetwork = this.prefs.getBoolPref("status.network");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.statusService.buildTextOrder();
            }
        },

        "status.network.xhr":
        {
            update: function () {
                this.statusNetworkXHR = this.prefs.getBoolPref("status.network.xhr");
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.statusService.buildTextOrder();
            }
        },

        "status.popup.invertMirror":
        {
            update: function () {
                this.statusUrlbarInvertMirror = this.prefs.getBoolPref("status.popup.invertMirror");
            },
            updateWindow: function (win) {
                let statusOverlay = win.hawkeye116477.status4evar.getters.statusOverlay;
                if (statusOverlay) {
                    statusOverlay.invertMirror = this.statusUrlbarInvertMirror;
                }
            }
        },

        "status.popup.mouseMirror":
        {
            update: function () {
                this.statusUrlbarMouseMirror = this.prefs.getBoolPref("status.popup.mouseMirror");
            },
            updateWindow: function (win) {
                let statusOverlay = win.hawkeye116477.status4evar.getters.statusOverlay;
                if (statusOverlay) {
                    statusOverlay.mouseMirror = this.statusUrlbarMouseMirror;
                }
            }
        },

        "status.timeout":
        {
            update: function () {
                this.statusTimeout = (this.prefs.getIntPref("status.timeout") * 1000);
            },
            updateWindow: function (win) {
                win.hawkeye116477.status4evar.statusService.updateStatusField(true);
            }
        },

        "status.toolbar.maxLength":
        {
            update: function () {
                this.statusToolbarMaxLength = this.prefs.getIntPref("status.toolbar.maxLength");
            },
            updateWindow: function (win) {
                let status_widget = win.hawkeye116477.status4evar.getters.statusWidget;
                if (status_widget) {
                    status_widget.maxWidth = (this.statusToolbarMaxLength || "");
                }
            }
        },

        "status.urlbar.align":
        {
            update: function () {
                switch (this.prefs.getIntPref("status.urlbar.align")) {
                    case 0:
                        this.statusUrlbarAlign = null;
                        break;
                    case 1:
                        this.statusUrlbarAlign = "left";
                        break;
                    default:
                        this.statusUrlbarAlign = "absolute";
                        break;
                }
            },
            updateWindow: function (win) {
                let urlbar = win.hawkeye116477.status4evar.getters.urlbar;
                if (urlbar) {
                    urlbar.s4esalign = this.statusUrlbarAlign;
                    urlbar.updateOverLinkLayout();
                }
            }
        },

        "status.urlbar.color":
        {
            update: function () {
                this.statusUrlbarColor = this.prefs.getCharPref("status.urlbar.color");
            },
            updateDynamicStyle: function (sheet) {
                sheet.cssRules[3].style.color = this.statusUrlbarColor;
            }
        },

        "status.urlbar.position":
        {
            update: function () {
                this.statusUrlbarPosition = this.prefs.getIntPref("status.urlbar.position");

                if (this.statusUrlbarPosition < 10) {
                    this.statusUrlbarPosition = 10;
                }
                else if (this.statusUrlbarPosition > 90) {
                    this.statusUrlbarPosition = 90;
                }
            },
            updateWindow: function (win) {
                let urlbar = win.hawkeye116477.status4evar.getters.urlbar;
                if (urlbar) {
                    urlbar.s4espos = this.statusUrlbarPosition;
                    urlbar.updateOverLinkLayout();
                }
            }
        }
    },

    // nsIObserver
    observe: function (subject, topic, data) {
        try {
            switch (topic) {
                case "quit-application":
                    this.shutdown();
                    break;
                case "nsPref:changed":
                    this.updatePref(data, true);
                    break;
            }
        }
        catch (e) {
            CU.reportError(e);
        }
    },

    startup: function () {
        this.prefs = Services.prefs.getBranch("extensions.hawkeye116477.s4e.").QueryInterface(CI.nsIPrefBranch2);

        this.migratePrefsRoot();

        this.firstRun = this.prefs.getBoolPref("firstRun");
        if (this.firstRun) {
            this.prefs.setBoolPref("firstRun", false);
        }

        this.firstRunAustralis = this.prefs.getBoolPref("firstRun.australis");
        if (this.firstRunAustralis && Services.vc.compare("28.*", Services.appinfo.version) < 0) {
            this.prefs.setBoolPref("firstRun.australis", false);
        }

        this.migrate();

        for (let pref in this.pref_registry) {
            let pro = this.pref_registry[pref];

            pro.update = pro.update.bind(this);
            if (pro.updateWindow) {
                pro.updateWindow = pro.updateWindow.bind(this);
            }
            if (pro.updateDynamicStyle) {
                pro.updateDynamicStyle = pro.updateDynamicStyle.bind(this);
            }

            this.prefs.addObserver(pref, this, true);

            this.updatePref(pref, false);
        }

        Services.obs.addObserver(this, "quit-application", true);
    },

    shutdown: function () {
        Services.obs.removeObserver(this, "quit-application");

        for (let pref in this.pref_registry) {
            this.prefs.removeObserver(pref, this);
        }

        this.prefs = null;
    },

    migratePrefsRoot: function () {
        let oldPrefs = Services.prefs.getBranch("status4evar.").QueryInterface(CI.nsIPrefBranch2);

        let childPrefs = oldPrefs.getChildList("");
        childPrefs.forEach(function (pref) {
            if (oldPrefs.prefHasUserValue(pref)) {
                switch (oldPrefs.getPrefType(pref)) {
                    case CI.nsIPrefBranch2.PREF_STRING:
                        this.prefs.setCharPref(pref, oldPrefs.getCharPref(pref));
                        break;
                    case CI.nsIPrefBranch2.PREF_INT:
                        this.prefs.setIntPref(pref, oldPrefs.getIntPref(pref));
                        break;
                    case CI.nsIPrefBranch2.PREF_BOOL:
                        this.prefs.setBoolPref(pref, oldPrefs.getBoolPref(pref));
                        break;
                }

                oldPrefs.clearUserPref(pref);
            }
        }, this);
    },

    migrate: function () {
        if (!this.firstRun) {
            let migration = 0;
            try {
                migration = this.prefs.getIntPref("migration");
            }
            catch (e) { }

            switch (migration) {
                case 5:
                    this.migrateBoolPref("status.detectFullScreen", "advanced.status.detectFullScreen");
                    break;
                case 6:
                    let oldDownloadAction = this.prefs.getIntPref("download.button.action");
                    let newDownloadAction = 1;
                    switch (oldDownloadAction) {
                        case 2:
                            newDownloadAction = 1;
                            break;
                        case 3:
                            newDownloadAction = 2;
                            break;
                        case 4:
                            newDownloadAction = 1;
                            break;
                    }
                    this.prefs.setIntPref("download.button.action", newDownloadAction);

                    if (oldDownloadAction == 4 && Services.vc.compare("26.0", Services.appinfo.version) > 0) {
                        this.prefs.setBoolPref("browser.download.useToolkitUI", true);
                    }
                    break;
                case CURRENT_MIGRATION:
                    break;
            }
        }

        this.prefs.setIntPref("migration", CURRENT_MIGRATION);
    },

    migrateBoolPref: function (oldPref, newPref) {
        if (this.prefs.prefHasUserValue(oldPref)) {
            this.prefs.setBoolPref(newPref, this.prefs.getBoolPref(oldPref));
            this.prefs.clearUserPref(oldPref);
        }
    },

    migrateIntPref: function (oldPref, newPref) {
        if (this.prefs.prefHasUserValue(oldPref)) {
            this.prefs.setIntPref(newPref, this.prefs.getIntPref(oldPref));
            this.prefs.clearUserPref(oldPref);
        }
    },

    migrateCharPref: function (oldPref, newPref) {
        if (this.prefs.prefHasUserValue(oldPref)) {
            this.prefs.setCharPref(newPref, this.prefs.getCharPref(oldPref));
            this.prefs.clearUserPref(oldPref);
        }
    },

    updatePref: function (pref, updateWindows) {
        if (!(pref in this.pref_registry)) {
            return;
        }
        let pro = this.pref_registry[pref];

        pro.update();

        if (updateWindows) {
            let windowsEnum = Services.wm.getEnumerator("navigator:browser");
            while (windowsEnum.hasMoreElements()) {
                this.updateWindow(windowsEnum.getNext(), pro);
            }
        }

        if (pro.alsoUpdate) {
            pro.alsoUpdate.forEach(function (alsoPref) {
                this.updatePref(alsoPref);
            }, this);
        }
    },

    // Update a browser window
    updateWindow: function (win, pro) {
        if (!(win instanceof CI.nsIDOMWindow)
            || !(win.document.documentElement.getAttribute("windowtype") == "navigator:browser")) {
            return;
        }

        if (pro) {
            this.handlePro(win, pro);
        }
        else {
            for (let pref in this.pref_registry) {
                this.handlePro(win, this.pref_registry[pref]);
            }
        }
    },

    handlePro: function (win, pro) {
        if (pro.updateWindow) {
            pro.updateWindow(win);
        }

        if (pro.updateDynamicStyle) {
            let styleSheets = win.document.styleSheets;
            for (let i = 0; i < styleSheets.length; i++) {
                let styleSheet = styleSheets[i];
                if (styleSheet.href == "chrome://status4evar/skin/dynamic.css") {
                    pro.updateDynamicStyle(styleSheet);
                    break;
                }
            }
        }
    },

    setBoolElementAttribute: function (elem, attr, val) {
        if (val) {
            elem.setAttribute(attr, "true");
        }
        else {
            elem.removeAttribute(attr);
        }
    },

    setStringElementAttribute: function (elem, attr, val) {
        if (val) {
            elem.setAttribute(attr, val);
        }
        else {
            elem.removeAttribute(attr);
        }
    },

    resetPrefs: function () {
        let childPrefs = this.prefs.getChildList("");
        childPrefs.forEach(function (pref) {
            if (this.prefs.prefHasUserValue(pref)) {
                this.prefs.clearUserPref(pref);
            }
        }, this);
    }
};

const s4e_service = new Status_4_Evar();
