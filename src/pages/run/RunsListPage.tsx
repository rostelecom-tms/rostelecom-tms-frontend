import {Alert, Card, Space, Spin, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {Link} from "react-router";
import {useRuns} from "../../hooks/run/runHooks.ts";
import type {IRun} from "../../models/run/run.ts";
import {getRunExecutorLabel, getRunStatusColor} from "../../utils/runPresentation.ts";

const {Text} = Typography

export const RunsListPage = () => {
    const {data: runs, isLoading, isError} = useRuns()

    if (isLoading) {
        return <Spin/>
    }

    if (isError || !runs) {
        return <Alert type="error" title="Не удалось загрузить запуски"/>
    }

    const columns: ColumnsType<IRun> = [
        {
            title: "Дата",
            dataIndex: "executedAt",
            key: "executedAt",
            width: 220,
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
        {
            title: "Тест-кейс",
            key: "case",
            render: (_, run) => <Link to={`/cases/${run.caseId}`}>{run.caseTitle || `Case #${run.caseId}`}</Link>,
        },
        {
            title: "Тест-план",
            key: "plan",
            render: (_, run) => <Link to={`/plans/${run.planId}`}>{run.planName || `Plan #${run.planId}`}</Link>,
        },
        {
            title: "Статус",
            key: "status",
            width: 140,
            render: (_, run) => <Tag color={getRunStatusColor(run.statusSlug)}>{run.statusName}</Tag>,
        },
        {
            title: "Исполнитель",
            key: "executedBy",
            render: (_, run) => getRunExecutorLabel(run),
        },
    ]

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Card title="Запуски">
                {runs.length ? (
                    <Table<IRun>
                        rowKey="id"
                        columns={columns}
                        dataSource={runs}
                        pagination={{pageSize: 20}}
                    />
                ) : (
                    <Text type="secondary">Запусков пока нет</Text>
                )}
            </Card>
        </Space>
    )
}
