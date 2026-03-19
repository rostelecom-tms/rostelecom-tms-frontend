import type {ColumnsType} from "antd/es/table";
import {Alert, Button, Card, Space, Spin, Table} from "antd";
import {useNavigate} from "react-router";
import Title from "antd/lib/typography/Title";
import {usePlans} from "../../hooks/plan/planHooks.ts";
import type {IPlan} from "../../models/plan/plan.ts";

export const PlansListPage = () => {
    const navigate = useNavigate()
    const {data, isLoading, isError} = usePlans()

    const columns: ColumnsType<IPlan> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Создан',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (value: string) => new Date(value).toLocaleString('ru-RU'),
        },
    ]

    if (isLoading) {
        return <Spin />
    }

    if (isError) {
        return <Alert type="error" title="Не удалось загрузить тест-планы" />
    }

    return (
        <Card>
            <Space
                style={{width: '100%', justifyContent: 'space-between', marginBottom: 16}}
            >
                <Title level={2} style={{margin: 0}}>Тест-планы</Title>
                <Button type="primary" onClick={() => navigate('/plans/create')}>
                    Создать план
                </Button>
            </Space>

            <Table<IPlan>
                rowKey="id"
                columns={columns}
                dataSource={data ?? []}
                pagination={{pageSize: 10}}
                onRow={record => ({
                    onClick: () => navigate(`/plans/${record.id}`),
                    style: {cursor: 'pointer'},
                })}
            />
        </Card>
    )
}