import {useAuth ,useUser} from "@clerk/react";
import {useEffect} from "react";
import {httpService} from "@/lib/http-service.ts";
import {showErrorPopup} from "@/lib/status-popup-store.ts";
import {navigate} from "wouter/use-browser-location";


const USERS_API_URL = String(import.meta.env.VITE_USERS_API_URL ?? '');


export function SignUpComplete() {

    const {isLoaded ,isSignedIn ,getToken} = useAuth();
    const {user} = useUser();

    useEffect(()=>{

        alert("is loaded " +isLoaded+" and is signed in ? "+isSignedIn);

        if(!isLoaded || !isSignedIn) return;

        const completeSignUp = async ()=>{

            const token = await getToken();

            alert(JSON.stringify(user));

            const userDetails = {
                auth_user_id : user?.id ,
                firstname : user?.firstName,
                lastname: user?.lastName,
                email : user?.primaryEmailAddress?.emailAddress,
            }

            alert(JSON.stringify(userDetails));

            httpService.setTokenGetter(()=> token);

            const success = (res)=> {
                navigate("/workspace");
            }

            const error=(res)=> showErrorPopup('Failed to sign up new users .Try again.');

            httpService.post(USERS_API_URL ,userDetails).then(success ,error);
        };

        completeSignUp();

    },[isSignedIn ,isLoaded]);

    return (
        <div className="grid min-h-screen place-items-center">
            <p>Completing your registration...</p>
        </div>
    );

}