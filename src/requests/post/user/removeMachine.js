import { signOutMachine } from "./userSignOut.js";

export default async function removeMachine(user, dept, resource) {
    const result = await signOutMachine(user, dept, resource);
    if(!result.error) {
        return true;
    }
    else {
        return false;
    }
}