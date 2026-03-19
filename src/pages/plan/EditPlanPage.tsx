import {ArrowLeftOutlined} from "@ant-design/icons";
import {Alert, App, Breadcrumb, Button, Card, Space, Spin, Typography} from "antd";
import {Link, useNavigate, useParams} from "react-router";
import {EditPlanForm, type EditPlanSubmitValues} from "../../components/plan/EditPlanForm.tsx";
import {useAddCaseToPlan, usePlan, useRemoveCaseFromPlan, useUpdatePlan} from "../../hooks/plan/planHooks.ts";

const {Title} = Typography;

export const EditPlanPage = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const planId = Number(id)
    const {message} = App.useApp()

    const {data: plan, isLoading, isError} = usePlan(planId)
    const updatePlanMutation = useUpdatePlan()
    const addCaseToPlanMutation = useAddCaseToPlan()
    const removeCaseFromPlanMutation = useRemoveCaseFromPlan()

    if (isLoading) {
        return <Spin />
    }

    if (isError || !plan) {
        return <Alert type="error" title="Не удалось загрузить тест-план" />
    }

    const handleSubmit = (values: EditPlanSubmitValues) => {
        const currentCaseIds = plan.cases?.map(testCase => testCase.id) ?? []
        const nextCaseIds = values.caseIds ?? []

        const caseIdsToAdd = nextCaseIds.filter(caseId => !currentCaseIds.includes(caseId))
        const caseIdsToRemove = currentCaseIds.filter(caseId => !nextCaseIds.includes(caseId))

        updatePlanMutation.mutate(
            {id: planId, request: values.request},
            {
                onSuccess: async () => {
                    await Promise.all([
                        ...caseIdsToAdd.map(caseId =>
                            addCaseToPlanMutation.mutateAsync({planId, caseId})
                        ),
                        ...caseIdsToRemove.map(caseId =>
                            removeCaseFromPlanMutation.mutateAsync({planId, caseId})
                        ),
                    ])

                    message.success("Тест-план обновлен")
                    navigate(`/plans/${planId}`)
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
                            title: <Link to="/plans">Тест-планы</Link>,
                        },
                        {
                            title: <Link to={`/plans/${planId}`}>{plan.name}</Link>,
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
                <Title level={2}>Редактирование тест-плана</Title>

                {updatePlanMutation.isError && (
                    <Alert
                        type="error"
                        title="Не удалось обновить тест-план"
                        style={{marginBottom: 16}}
                    />
                )}

                <EditPlanForm
                    initialValues={plan}
                    loading={
                        updatePlanMutation.isPending ||
                        addCaseToPlanMutation.isPending ||
                        removeCaseFromPlanMutation.isPending
                    }
                    onSubmit={handleSubmit}
                />
            </Card>
        </Space>
    )
}