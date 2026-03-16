import React, {createElement, type FC} from 'react';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import {Outlet, useLocation, useNavigate} from "react-router";
import constants from "../../utils/constants.ts";
import {navigationBottomItems, navigationTopItems} from "../../utils/menu.ts";

const { Header, Content, Footer, Sider } = Layout;

const siderStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    display: 'flex',
    flexDirection: 'column',
};

const topMenuItems: MenuProps['items'] = navigationTopItems.map((item) => ({
    key: item.key,
    icon: createElement(item.icon),
    label: item.label,
}));

const bottomMenuItems: MenuProps['items'] = navigationBottomItems.map((item) => ({
    key: item.key,
    icon: createElement(item.icon),
    label: item.label,
}));




export const AppLayout: FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const location = useLocation();
    const navigate = useNavigate();

    const selectedTopKey =
        navigationTopItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '';

    const selectedBottomKey =
        navigationBottomItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '';

    return (
        <Layout hasSider>
            <Sider style={siderStyle}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100%',
                    }}
                >
                    <div>
                        <div
                            style={{
                                height: 64,
                                margin: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 18,
                                fontWeight: 600,
                            }}
                        >
                            <img src="/public/logo.png" alt="logo" style={{ height: 64 }}/>
                        </div>

                        <Menu
                            theme="dark"
                            mode="inline"
                            items={topMenuItems}
                            selectedKeys={selectedTopKey ? [selectedTopKey] : []}
                            onClick={({ key }) => navigate(key)}
                        />
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <Menu
                            theme="dark"
                            mode="inline"
                            items={bottomMenuItems}
                            selectedKeys={selectedBottomKey ? [selectedBottomKey] : []}
                            onClick={({ key }) => navigate(key)}
                        />
                    </div>
                </div>
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <Outlet/>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Rostelecom TMS v{constants.VERSION}
                </Footer>
            </Layout>
        </Layout>
    );
};