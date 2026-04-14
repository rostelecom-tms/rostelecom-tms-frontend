import {ArrowLeftOutlined} from "@ant-design/icons";
import {Alert, App, Breadcrumb, Button, Card, Space, Spin, Typography} from "antd";
import {useMemo} from "react";
import {Link, useNavigate} from "react-router";
import {CreateCaseForm, type CreateCaseSubmitValues} from "../../components/case/CreateCaseForm.tsx";
import {useCases, useCreateCase} from "../../hooks/case/caseHooks.ts";
import {useGroups} from "../../hooks/case/groupHooks.ts";

const {Title} = Typography;

export const CreateCasePage = () => {
    const navigate = useNavigate()
    const createCaseMutation = useCreateCase()
    const {message} = App.useApp()

    const {data: groups, isLoading: isGroupsLoading, isError: isGroupsError} = useGroups()
    const {data: cases} = useCases()
    const existingTags = useMemo(
        () => Array.from(new Set((cases ?? []).flatMap(testCase => testCase.tags ?? []))).sort((a, b) => a.localeCompare(b)),
        [cases]
    )

    if (isGroupsLoading) {
        return <Spin />
    }

    if (isGroupsError || !groups) {
        return <Alert type="error" title="Не удалось загрузить группы" />
    }


    const handleSubmit = (values: CreateCaseSubmitValues) => {
        createCaseMutation.mutate(values.request, {
            onSuccess: (createdCase) => {
                message.success("Тест-кейс создан")
                navigate(`/cases/${createdCase.id}`)
            },
        })
    }

    return (
        <Space orientation="vertical" size="large" style={{width: "100%"}}>
            <Space orientation="vertical" size="middle" style={{width: "100%"}}>
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/cases">Тест-кейсы</Link>,
                        },
                        {
                            title: "Создание",
                        },
                    ]}
                />

                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Назад
                </Button>
            </Space>

            <Card>
                <Title level={2}>Создание тест-кейса</Title>

                {createCaseMutation.isError && (
                    <Alert
                        type="error"
                        title="Не удалось создать тест-кейс"
                        style={{marginBottom: 16}}
                    />
                )}

                <CreateCaseForm
                    loading={createCaseMutation.isPending}
                    groups={groups}
                    existingTags={existingTags}
                    onSubmit={handleSubmit}
                />
            </Card>
        </Space>
    )
}
