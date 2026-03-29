import { apiRequest } from "../../config/api";


export const addUserAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "users/addUser",
        body: data
    })
}

export const getUserByEmailAPI = async (email) => {
    console.log(email)
    return await apiRequest({
        method: "POST",
        route: "users/getUserByEmail",
        body: {
            email,
        }
    })
}

export const getUsersAPI = async (estabelecimentoId) => {
    return await apiRequest({
        method: "POST",
        route: "users/getUsers",
        body: {
            estabelecimentoId,
        }
    })
}

export const getActiveUsersAppointmentAllowedAPI = async (estabelecimentoId) => {
    return await apiRequest({
        method: "POST",
        route: "users/getActiveUsersAppointmentAllowed",
        body: {
            estabelecimentoId,
        }
    })
}

export const updateUserAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "users/updateUser",
        body: data
    })
}

export const deleteUserAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "users/deleteUser",
        body: data
    })
}