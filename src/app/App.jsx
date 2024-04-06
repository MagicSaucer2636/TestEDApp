import React, { useState } from 'react';
import axios from 'axios';


function App() {

    if((localStorage.getItem("account") == null || localStorage.getItem("token") === null) && (sessionStorage.getItem("account") === null || sessionStorage.getItem("token") === null)) {
        window.location.href = "/";
    }

    const [token, setToken] = useState(localStorage.getItem("token") || sessionStorage.getItem("token"));
    const [account, setAccount] = useState(localStorage.getItem("account") || sessionStorage.getItem("account"));
    const account_id = JSON.parse(account).id;

    const deconexion = () => {
        localStorage.removeItem("account");
        localStorage.removeItem("token");
        sessionStorage.removeItem("account");
        sessionStorage.removeItem("token");
        window.location.href = "/";
    }

    /* Ici ça fonctionne pas !!! */
    /* Erreur : 525 - "Session expirée !" */
    (async () => {
        const url = `https://api.ecoledirecte.com/v3/eleve/${account_id}/entreprisesV3.awp?verbe=post`;
        const data = {
            token: token,
        };
        await axios.post(url, `data=${JSON.stringify(data)}`, ).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        });
      })();

    

    return (
        <>
            <button onClick={deconexion}>Déconnexion</button>
        </>
    )
}

export default App;