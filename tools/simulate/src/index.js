import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultTheme, Provider, ListView, Item, TextField, Flex } from '@adobe/react-spectrum';

const STORAGE_KEY = 'hlxSidekickPersonalisationContext';

const Simulate = ({ personalizationType, emailBody }) => {
    let [{ values, items }, setState] = useState({
        values: {},
        items: []
    })

    const updateEl = (key, value) => {
        setState((oldState) => ({
            ...oldState,
            values: {
                ...oldState.values,
                [key]: value
            }
        }));
    }

    useEffect(() => {
        let items;
        let values = window.localStorage.getItem(STORAGE_KEY);

        if (personalizationType === 'adobe-campaign-standard') {
            items = [...emailBody.querySelectorAll('[data-nl-expr]')].map((span) => ({
                el: span,
                expr: span.dataset.nlExpr,
                label: span.innerText,
                value: span.innerText
            }));
        } else if (personalizationType === 'adobe-campaign-classic') {
            items = [...emailBody.querySelectorAll('[data-nl-expr]')].map((span) => {
                const { nlExpr } = span.dataset;
                const label = nlExpr.split('.').pop();
                return {
                    el: span,
                    expr: nlExpr,
                    label: label,
                    value: label
                }
            });
        }


        if (values) {
            values = JSON.parse(values);
        } else {
            values = {};
        }

        setState({ values, items });
    }, [emailBody])

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));

        Object.entries(values).forEach(([key, value]) => {
            const item = items.find((item) => item.expr === key);
            if (item && item.el) {
                item.el.innerText = value;
            }
        });
    }, [values])

    return (
        <Provider theme={defaultTheme} height="100%">
            <Flex direction="column" height="100%">
                <ListView
                    aria-label="List of Personalization Fields"
                    items={Object.values(items)}
                    width="100%"
                    height="100%"
                    density="spacious"
                    selectionMode="none">
                    {({ el, expr, label }) => (
                        <Item key={expr} textValue={label}>
                            <TextField
                                label={label}
                                defaultValue={values[expr] !== undefined ? values[expr] : label}
                                onChange={(text) => updateEl(expr, text, el)} />
                        </Item>
                    )}
                </ListView>
            </Flex>
        </Provider>
    );
}

const { personalizationType } = top;
const emailBody = top.document.getElementById('__emailFrame').contentWindow.document.body;
const app = document.getElementById("app");
const root = createRoot(app);
root.render(<Simulate personalizationType={personalizationType} emailBody={emailBody} />);
