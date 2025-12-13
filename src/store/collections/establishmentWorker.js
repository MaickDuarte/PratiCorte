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
    return await getDoc({
        collection: "estabelecimentos",
        queries: [
            where("email", "==", user.email),
        ]
    })
}

export const updateEstablishment = async (data) => {
    return await updateDoc({ collection: "estabelecimentos", data: data});
}
