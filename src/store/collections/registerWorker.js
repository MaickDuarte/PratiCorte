import { addEstablishmentAPI } from "./establishmentWorker";

export const addEstablishment = async (data) => {
    return await addEstablishmentAPI(data);
};