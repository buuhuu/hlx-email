import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultTheme, Provider, ListView, Item, Text, ActionButton, Flex, Breadcrumbs } from '@adobe/react-spectrum';
import Folder from '@spectrum-icons/illustrations/Folder';
import Copy from '@spectrum-icons/workflow/Copy';

const Personalization = () => {
    const [{ source, loadingState, path, folderItems }, setState] = useState({
        items: [],
        folderItems: [],
        path: [],
        source: {
            api: 'https://personalization.buuhuuu.workers.dev/personalisationFields',
            delivery: 'mail'
        },
        loadingState: 'loading'
    });

    const loadItems = async () => {
        const url = `${source.api}?delivery=${source.delivery}`;
        const resp = await fetch(url);
        if (resp.ok) {
            const items = await resp.json();
            setState(oldState => ({
                ...oldState,
                items,
                folderItems: items,
                path: [{
                    label: 'All',
                    key: ':root',
                    items
                }],
                loadingState: 'idle'
            }));
        }
    }

    const copyToClipboard = (key) => {
        const html = `<em>${key}</em>`;

        navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([html], { type: 'text/plain' }),
                'text/html': new Blob([html], { type: 'text/html' }),
            }),
        ]);
    };

    const clickListItem = (key) => {
        const item = folderItems.find((item) => item.key === key);
        if (item && item.items) {
            selectFolder(key, item);
        }
    }

    const selectFolder = (key, item) => {
        setState((oldState) => {
            let newPath;
            if (item) {
                newPath = [...oldState.path, item];
            } else {
                // called from breadcrumb
                const index = path.findIndex((pathItem) => pathItem.key === key);
                newPath = path.slice(0, index + 1);
                item = path[index];
            }
            return {
                ...oldState,
                folderItems: item.items,
                path: newPath
            }
        });
    }

    useEffect(() => {
        loadItems()
    }, [])


    return (
        <Provider theme={defaultTheme} height="100%">
            <Flex direction="column" height="100%">
                {path.length > 1 && (
                    <Breadcrumbs onAction={selectFolder}>
                        {path.map(c => <Item key={c.key}>{c.label}</Item>)}
                    </Breadcrumbs>
                )}
                <ListView
                    aria-label="List of Personalization Fields"
                    items={Object.values(folderItems)}
                    loadingState={loadingState}
                    width="100%"
                    height="100%"
                    density="spacious"
                    selectionMode="none"
                    onAction={clickListItem} >
                    {({ key, label, ...item }) => {
                        if (item.items) {
                            // is Folder
                            return (
                                <Item key={key} textValue={name} hasChildItems>
                                    <Folder />
                                    <Text>{label}</Text>
                                    {item.items.length && <Text slot="description">{item.items.length} items</Text>}
                                </Item>
                            )
                        } else {
                            return (
                                <Item key={key} textValue={label}>
                                    <Text>{label}</Text>
                                    <ActionButton aria-label="Copy" onPress={() => copyToClipboard(key)}><Copy /></ActionButton>
                                </Item>
                            );
                        }
                    }}
                </ListView>
            </Flex>
        </Provider>
    );
}

const app = document.getElementById("app");
const root = createRoot(app);
root.render(<Personalization />);
