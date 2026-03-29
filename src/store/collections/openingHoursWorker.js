import { apiRequest } from "../../config/api";

export const addOpeningHoursAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "openingHours/addOpeningHours",
        body: data
    });
};

export const updateOpeningHoursAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "openingHours/updateOpeningHours",
        body: data
    });
};

export const getOpeningHoursAPI = async (estabelecimentoId) => {
    return await apiRequest({
        method: "POST",
        route: "openingHours/getOpeningHours",
        body: { estabelecimentoId }
    });
};

export const getOpeningHoursByIdAPI = async (id) => {
    return await apiRequest({
        method: "POST",
        route: "openingHours/getOpeningHoursById",
        body: { id }
    });
};