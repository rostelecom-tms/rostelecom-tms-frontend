import type {ColumnsType} from "antd/es/table";
import {Alert, Button, Card, Input, Select, Space, Spin, Table} from "antd";
import {useMemo, useState} from "react";
import {useNavigate} from "react-router";
import Title from "antd/lib/typography/Title";
import {usePlansPage} from "../../hooks/plan/planHooks.ts";
import {useUsers} from "../../hooks/user/userHooks.ts";
import type {IPlan} from "../../models/plan/plan.ts";

export const PlansListPage = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(10)
    const [nameDraft, setNameDraft] = useState("")
    const [nameFilter, setNameFilter] = useState("")
    const [responsibleUserIdFilter, setResponsibleUserIdFilter] = useState<number | undefined>(undefined)

    const queryParams = useMemo(() => ({
        page: page - 1,
        size,
        name: nameFilter.trim() || undefined,
        responsibleUserId: responsibleUserIdFilter,
    }), [page, size, nameFilter, responsibleUserIdFilter])

    const {data, isLoading, isError} = usePlansPage(queryParams)
    const {data: users} = useUsers()

    const columns: ColumnsType<IPlan> = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Ответственный",
            key: "responsibleUser",
            render: (_, record) => {
                if (!record.responsibleUser) {
                    return "Не указан"
                }
                if (record.responsibleUser.username) {
                    return `${record.responsibleUser.username} (${record.responsibleUser.email})`
                }
                return record.responsibleUser.email
            }
        },
        {
            title: "Создан",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string) => new Date(value).toLocaleString("ru-RU"),
        },
    ]

    if (isLoading) {
        return <Spin/>
    }

    if (isError || !data) {
        return <Alert type="error" title="Не удалось загрузить тест-планы"/>
    }

    return (
        <Card>
            <Space style={{width: "100%", justifyContent: "space-between", marginBottom: 16}}>
                <Title level={2} style={{margin: 0}}>Тест-планы</Title>
                <Button type="primary" onClick={() => navigate("/plans/create")}>
                    Создать план
                </Button>
            </Space>

            <Space wrap style={{marginBottom: 16}}>
                <Input.Search
                    placeholder="Поиск по названию"
                    allowClear
                    value={nameDraft}
                    onChange={event => {
                        setNameDraft(event.target.value)
                    }}
                    onSearch={() => {
                        setNameFilter(nameDraft)
                        setPage(1)
                    }}
                    style={{width: 280}}
                    enterButton="Найти"
                />
                <Select
                    placeholder="Ответственный"
                    allowClear
                    value={responsibleUserIdFilter}
                    style={{width: 320}}
                    options={(users ?? []).map(user => ({
                        value: user.id,
                        label: user.username ? `${user.username} (${user.email})` : user.email
                    }))}
                    onChange={value => {
                        setResponsibleUserIdFilter(value)
                        setPage(1)
                    }}
                />
            </Space>

            <Table<IPlan>
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
                onRow={record => ({
                    onClick: () => navigate(`/plans/${record.id}`),
                    style: {cursor: "pointer"},
                })}
            />
        </Card>
    )
}
