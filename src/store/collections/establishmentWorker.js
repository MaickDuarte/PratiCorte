import { getDoc, updateDoc } from "./collectionBaseWorker";
import { where } from "firebase/firestore"

export const getEstablishmentById = async (id) => {
    return await getDoc({
        collection: "estabelecimentos",
        queries: [
            where("id", "==", id),
        ]
    })
}

export const getEstablishmentByUser = async (user) => {
    const userData = Array.isArray(user) ? user[0] : user;
    return await getDoc({
        collection: "estabelecimentos",
        queries: [
            where("id", "==", userData.estabelecimentoId),
        ]
    })
}

export const updateEstablishment = async (data) => {
    return await updateDoc({ collection: "estabelecimentos", data: data});
}
