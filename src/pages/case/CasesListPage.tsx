import {useCases} from "../../hooks/case/caseHooks.ts";
import type {ColumnsType} from "antd/es/table";
import type {ICase} from "../../models/case/case.ts";
import {Alert, Card, Spin, Table} from "antd";
import {useNavigate} from "react-router";
import Title from "antd/lib/typography/Title";

export const CasesListPage = () => {
    const navigate = useNavigate()
    const {data, isLoading, isError} = useCases()

    const columns: ColumnsType<ICase> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
        },
    ]

    if (isLoading) {
        return <Spin />
    }

    if (isError) {
        return <Alert type="error" title="Не удалось загрузить тест-кейсы" />
    }

    return (
        <Card>
            <Title level={2}>Тест-кейсы</Title>

            <Table<ICase>
                rowKey="id"
                columns={columns}
                dataSource={data ?? []}
                pagination={{ pageSize: 10 }}
                onRow={record => ({
                    onClick: () => navigate(`/cases/${record.id}`),
                    style: { cursor: 'pointer' },
                })}
            />
        </Card>
    )
}