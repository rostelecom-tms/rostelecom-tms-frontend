import {ArrowLeftOutlined} from "@ant-design/icons";
import {Alert, App, Breadcrumb, Button, Card, Space, Spin, Typography} from "antd";
import {useMemo} from "react";
import {Link, useNavigate, useParams} from "react-router";
import {EditCaseForm, type EditCaseSubmitValues} from "../../components/case/EditCaseForm.tsx";
import {useCase, useCases, useUpdateCase} from "../../hooks/case/caseHooks.ts";
import {useGroups} from "../../hooks/case/groupHooks.ts";

const {Title} = Typography;

export const EditCasePage = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const caseId = Number(id)
    const {message} = App.useApp()

    const {data: testCase, isLoading, isError} = useCase(caseId)
    const {data: cases} = useCases()
    const {data: groups, isLoading: isGroupsLoading, isError: isGroupsError} = useGroups()
    const updateCaseMutation = useUpdateCase()
    const existingTags = useMemo(
        () => Array.from(new Set((cases ?? []).flatMap(item => item.tags ?? []))).sort((a, b) => a.localeCompare(b)),
        [cases]
    )

    if (isLoading) {
        return <Spin />
    }

    if (isError || !testCase) {
        return <Alert type="error" title="Не удалось загрузить тест-кейс" />
    }


    if (isGroupsLoading) {
        return <Spin />
    }

    if (isGroupsError || !groups) {
        return <Alert type="error" title="Не удалось загрузить группы" />
    }


    const handleSubmit = (values: EditCaseSubmitValues) => {
        updateCaseMutation.mutate(
            {id: caseId, request: values.request},
            {
                onSuccess: () => {
                    message.success("Тест-кейс обновлён")
                    navigate(`/cases/${caseId}`)
                },
            }
        )
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
                            title: <Link to={`/cases/${caseId}`}>{testCase.title}</Link>,
                        },
                        {
                            title: "Редактирование",
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
                <Title level={2}>Редактирование тест-кейса</Title>

                {updateCaseMutation.isError && (
                    <Alert
                        type="error"
                        title="Не удалось обновить тест-кейс"
                        style={{marginBottom: 16}}
                    />
                )}

                <EditCaseForm
                    initialValues={testCase}
                    groups={groups}
                    existingTags={existingTags}
                    loading={updateCaseMutation.isPending}
                    onSubmit={handleSubmit}
                />
            </Card>
        </Space>
    )
}
