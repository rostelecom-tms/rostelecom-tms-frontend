import {api} from "../axios.ts";
import type {IDefect, IDefectCreateRequest, IDefectUpdateRequest} from "../../models/case/defect.ts";

export default {
    list: async (caseId?: number): Promise<IDefect[]> => {
        const response = await api.get<IDefect[]>("/defects", {
            params: { caseId },
        });
        return response.data;
    },

    create: async (request: IDefectCreateRequest): Promise<IDefect> => {
        const response = await api.post<IDefect>("/defects", request);
        return response.data;
    },

    update: async (id: number, request: IDefectUpdateRequest): Promise<void> => {
        await api.patch<void>(`/defects/${id}`, request);
    },
};
