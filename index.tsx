/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    findGroupChildrenByChildId,
    NavContextMenuPatchCallback
} from "@api/ContextMenu";
import * as DataStore from "@api/DataStore";
import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { Channel } from "@vencord/discord-types";
import { ChannelType } from "@vencord/discord-types/enums";
import { Menu } from "@webpack/common";

const STORAGE_KEY = "StreamPrivacy_ProtectedDMs";

const protectedDMs = new Set<string>();

const settings = definePluginSettings({
    privacyMode: {
        type: OptionType.BOOLEAN,
        description: "Manually enable privacy protection",
        default: false
    }
});

let maskStyle: HTMLStyleElement | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

function refreshMask(): void {
    if (!maskStyle) return;

    if (!settings.store.privacyMode) {
        maskStyle.textContent = "";
        return;
    }

    const rules = [...protectedDMs]
        .filter(id => /^\d+$/.test(id))
        .map(id => `
            a[href="/channels/@me/${id}"] {
                filter: blur(16px) !important;
            }
        `)
        .join("\n");

    if (maskStyle.textContent !== rules) {
        maskStyle.textContent = rules;
    }
}

function isProtected(channelId: string): boolean {
    return protectedDMs.has(channelId);
}

function toggleProtection(channelId: string): void {
    if (protectedDMs.has(channelId)) {
        protectedDMs.delete(channelId);
    } else {
        protectedDMs.add(channelId);
    }

    void DataStore.set(
        STORAGE_KEY,
        [...protectedDMs]
    );
    refreshMask();
}

const patchDMMenu: NavContextMenuPatchCallback = (
    children,
    { channel }: { channel?: Channel }
) => {
    if (!channel || channel.type !== ChannelType.DM) {
        return;
    }

    const group = findGroupChildrenByChildId(
        "close-dm",
        children
    );

    if (!group) return;

    group.push(
        <Menu.MenuItem
            id="streamprivacy-protect-dm"
            key="streamprivacy-protect-dm"
            label={
                isProtected(channel.id)
                    ? "Unprotect DM"
                    : "Protect DM"
            }
            action={() => toggleProtection(channel.id)}
        />
    );
};

export default definePlugin({
    name: "StreamPrivacy",

    description:
        "Protect selected DMs during screen-sharing.",

    authors: [
        {
            name: "byhatedev",
            id: 1107648990905909310n,
        }
    ],
    settings,

    contextMenus: {
        "user-context": patchDMMenu
    },

    async start() {
        const stored = await DataStore.get<string[]>(
            STORAGE_KEY
        );

        protectedDMs.clear();

        if (Array.isArray(stored)) {
            for (const id of stored) {
                protectedDMs.add(id);
            }
        }

        maskStyle = document.createElement("style");
        maskStyle.id = "vc-streamprivacy-mask";

        document.head.appendChild(maskStyle);

        refreshMask();

        refreshTimer = setInterval(refreshMask, 250);
    },

    stop() {
        if (refreshTimer !== null) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }

        maskStyle?.remove();
        maskStyle = null;
    }
});
