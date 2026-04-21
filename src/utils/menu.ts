import {
    AlertOutlined,
    BookOutlined,
    FileTextOutlined,
    RocketOutlined,
    UserOutlined,
    PieChartOutlined,
    TeamOutlined
} from '@ant-design/icons';

export const navigationTopItems = [
    {
        key: '/dashboard',
        label: 'Дашборд',
        icon: PieChartOutlined,
    },
    {
        key: '/plans',
        label: 'Тест-планы',
        icon: BookOutlined,
    },
    {
        key: '/cases',
        label: 'Тест-кейсы и группы',
        icon: FileTextOutlined,
    },
    {
        key: '/runs',
        label: 'Запуски',
        icon: RocketOutlined,
    },
    {
        key: '/defects',
        label: 'Дефекты',
        icon: AlertOutlined,
    },
    {
        key: '/users',
        label: 'Пользователи',
        icon: TeamOutlined,
    },
]

export const navigationBottomItems = [
    {
        key: '/account',
        label: 'Профиль',
        icon: UserOutlined,
    },
]
