import {Alert, Card, Select, Space, Spin, Table, Tag, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {Link} from "react-router";
import {useMemo, useState} from "react";
import {useRunsPage, useRunStatuses} from "../../hooks/run/runHooks.ts";
import type {IRun} from "../../models/run/run.ts";
import {getRunExecutorLabel, getRunStatusColor} from "../../utils/runPresentation.ts";
import {usePlans} from "../../hooks/plan/planHooks.ts";
import {useCases} from "../../hooks/case/caseHooks.ts";
import {useUsers} from "../../hooks/user/userHooks.ts";

const {Text} = Typography

export const RunsListPage = () => {
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(20)
    const [planIdFilter, setPlanIdFilter] = useState<number | undefined>(undefined)
    const [caseIdFilter, setCaseIdFilter] = useState<number | undefined>(undefined)
    const [statusSlugFilter, setStatusSlugFilter] = useState<string | undefined>(undefined)
    const [executedByFilter, setExecutedByFilter] = useState<number | undefined>(undefined)

    const queryParams = useMemo(() => ({
        page: page - 1,
        size,
        planId: planIdFilter,
        caseId: caseIdFilter,
        statusSlug: statusSlugFilter,
        executedBy: executedByFilter,
    }), [page, size, planIdFilter, caseIdFilter, statusSlugFilter, executedByFilter])

    const {data, isLoading, isError} = useRunsPage(queryParams)
    const {data: plans} = usePlans()
    const {data: cases} = useCases()
    const {data: users} = useUsers()
    const {data: runStatuses} = useRunStatuses()

    if (isLoading) {
        return <Spin/>
    }

    if (isError || !data) {
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
                <Space wrap style={{marginBottom: 16}}>
                    <Select
                        allowClear
                        placeholder="Тест-план"
                        value={planIdFilter}
                        style={{width: 260}}
                        options={(plans ?? []).map(plan => ({value: plan.id, label: plan.name}))}
                        onChange={value => {
                            setPlanIdFilter(value)
                            setPage(1)
                        }}
                    />
                    <Select
                        allowClear
                        placeholder="Тест-кейс"
                        value={caseIdFilter}
                        style={{width: 300}}
                        options={(cases ?? []).map(testCase => ({value: testCase.id, label: `${testCase.id} - ${testCase.title}`}))}
                        onChange={value => {
                            setCaseIdFilter(value)
                            setPage(1)
                        }}
                    />
                    <Select
                        allowClear
                        placeholder="Статус"
                        value={statusSlugFilter}
                        style={{width: 180}}
                        options={(runStatuses ?? []).map(status => ({value: status.slug, label: status.name}))}
                        onChange={value => {
                            setStatusSlugFilter(value)
                            setPage(1)
                        }}
                    />
                    <Select
                        allowClear
                        placeholder="Исполнитель"
                        value={executedByFilter}
                        style={{width: 300}}
                        options={(users ?? []).map(user => ({
                            value: user.id,
                            label: user.username ? `${user.username} (${user.email})` : user.email
                        }))}
                        onChange={value => {
                            setExecutedByFilter(value)
                            setPage(1)
                        }}
                    />
                </Space>

                {data.content.length ? (
                    <Table<IRun>
                        rowKey="id"
                        columns={columns}
                        dataSource={data.content}
                        pagination={{
                            current: data.page + 1,
                            pageSize: data.size,
                            total: data.totalElements,
                            showSizeChanger: true,
                            onChange: (nextPage, nextSize) => {
                                setPage(nextPage)
                                setSize(nextSize)
                            },
                        }}
                    />
                ) : (
                    <Text type="secondary">Запусков не найдено</Text>
                )}
            </Card>
        </Space>
    )
}
