import {ArrowLeftOutlined} from "@ant-design/icons";
import {Alert, App, Breadcrumb, Button, Card, Space, Typography} from "antd";
import {Link, useNavigate} from "react-router";
import {CreatePlanForm, type CreatePlanSubmitValues} from "../../components/plan/CreatePlanForm.tsx";
import {useAddCaseToPlan, useCreatePlan} from "../../hooks/plan/planHooks.ts";

const {Title} = Typography;

export const CreatePlanPage = () => {
    const navigate = useNavigate()
    const createPlanMutation = useCreatePlan()
    const addCaseToPlanMutation = useAddCaseToPlan()
    const {message} = App.useApp()

    const handleSubmit = (values: CreatePlanSubmitValues) => {
        createPlanMutation.mutate(values.request, {
            onSuccess: async (createdPlan) => {
                const selectedCaseIds = values.caseIds ?? []

                await Promise.all(
                    selectedCaseIds.map(caseId =>
                        addCaseToPlanMutation.mutateAsync({
                            planId: createdPlan.id,
                            caseId,
                        })
                    )
                )

                message.success("Тест-план создан")
                navigate(`/plans/${createdPlan.id}`)
            },
        })
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
                <Title level={2}>Создание тест-плана</Title>

                {createPlanMutation.isError && (
                    <Alert
                        type="error"
                        title="Не удалось создать тест-план"
                        style={{marginBottom: 16}}
                    />
                )}

                <CreatePlanForm
                    loading={createPlanMutation.isPending || addCaseToPlanMutation.isPending}
                    onSubmit={handleSubmit}
                />
            </Card>
        </Space>
    )
}