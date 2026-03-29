import { apiRequest } from "../../config/api";

export const addEstablishmentAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "establishments/addEstablishment",
        body: data
    });
};

export const getEstablishmentById = async (id) => {
    return await apiRequest({
        method: "POST",
        route: "establishments/getEstablishmentById",
        body: { id }
    });
};

export const getEstablishmentByUser = async (user) => {
    const userData = Array.isArray(user) ? user[0] : user;
    return await apiRequest({
        method: "POST",
        route: "establishments/getEstablishmentByUser",
        body: { estabelecimentoId: userData.estabelecimentoId }
    });
};

export const getEstablishments = async () => {
    return await apiRequest({
        method: "POST",
        route: "establishments/getEstablishments",
        body: {}
    });
};

export const updateEstablishment = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "establishments/updateEstablishment",
        body: data
    });
};
