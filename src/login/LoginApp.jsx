import React, { useState } from 'react';
import axios from 'axios';
import music_img from './../assets/music-pattern.jpg';


function LoginApp() {
  if(localStorage.getItem("account") && localStorage.getItem("token") || sessionStorage.getItem("account") && sessionStorage.getItem("token")) {
    window.location.href = "/app";
  }

  const version = '0.1.0';

  const [visible, setVisible] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [A2fFocus, setA2fFocus] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [A2fSelection, setA2fSelection] = useState('');

  const [error, setError] = useState(false);

  const [a2f, setA2f] = useState(false);
  const [question, setQuestion] = useState('');
  const [propositions, setPropositions] = useState([]);

  const [token, setToken] = useState('');
  const [account, setAccount] = useState('');
  
  const handleUsernameFocus = () => setUsernameFocus(true);
  const handleUsernameBlur = () => setUsernameFocus(false);
  const handlePasswordFocus = () => setPasswordFocus(true);
  const handlePasswordBlur = () => setPasswordFocus(false);
  const handleA2fFocus = () => setA2fFocus(true);
  const handleA2fBlur = () => setA2fFocus(false);
  
  const handlePasswordVisibility = () => setVisible(!visible);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if(a2f) {
      if(A2fSelection == 'Choisir une reponse' || A2fSelection == '') {
        return setError('Veuillez choisir une réponse');
      } else {
        EdPostA2f(token, A2fSelection).then((A2fReturn) => {
          if(A2fReturn.error) {
            return setError(A2fReturn.message);
          } else {
            EdLogin(username, password, A2fReturn.data).then((response) => {
              if(response.error) {
                return setError(response.message);
              } else {
                setToken(response.token);
                logged(response.account);
              }
            });
          }
        });
      }
    } else {
      if(username == '' || password == '') {
        return setError('Veuillez remplir tous les champs');
      } else {
        EdLogin(username, password).then((response) => {
          if(response.error) {
            return setError(response.message);
          } else {
            const token = response.token;
            if(response.a2f) {
              setToken(token);
              setError(false);
              edGetA2f(token).then((response) => {
                if(response.error) {
                  return setError(response.message);
                } else {
                  setA2f(true);
                  setQuestion(response.question);
                  setPropositions((response.propositions).sort());
                }
              });
            } else {
              setToken(token);
              setAccount(response.account);
              logged(response.account);
            }
          }
        });
      }
    }
  };

  const logged = (tempAccount) => {
    const classAccept = ['2GTA', '2GTB', '2GTC', '2GTD', '2GTE', '2GTF', '2GTG', '2GTH', '1LG1', '1LG2', '1LG3', '1LG4', '1LG5', '1LG6', 'TG1', 'TG2', 'TG3', 'TG4', 'TG5'];
    const typeCompte = tempAccount.typeCompte;
    const classCompte = tempAccount.profile.classe.code;
    if(typeCompte === 'E') {
      if(classAccept.includes(classCompte)) {
        const account = {
          id: tempAccount.id,
          nom: tempAccount.nom,
          prenom: tempAccount.prenom,
          classe: tempAccount.profile.classe.code,
          photo_url: "https://api.ecole-directe.plus/proxy?url=https%3A" + encodeURIComponent(tempAccount.profile.photo)
        }
        if(remember) {
          localStorage.setItem("account", JSON.stringify(account));
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("account", JSON.stringify(account));
          sessionStorage.setItem("token", token);
        }
        console.log("Good !")
        (async () => {
          const url = `https://api.ecoledirecte.com/v3/eleve/${tempAccount.id}/entreprisesV3.awp?verbe=post`;
          const data = {
              token: token,
          };
          try {
              const response = await axios.post(url, data);
              console.log(response);
          } catch (error) {
              console.error(error);
          }
      })();
        window.location.href = "/app";
      } else {
        setA2f(false);
        return setError('Classe non autorisée !');
      }
    } else {
      setA2f(false);
      return setError('Type de compte non prix en charge !');
    }
  }

  return (
    <div className='h-screen md:flex'>
      <div className='relative overflow-hidden md:flex w-2/3 hidden max-lg:w-1/2'>
        <img src={music_img} className='h-full w-full object-cover absolute'></img>
        <a href={'https://github.com/MartinKoscianski/MusicCommunityPlayer/releases/tag/' + version} target='_blank' className='absolute bottom-3 right-6 text-white text-s'>v{version}</a>
        <a href='https://github.com/MartinKoscianski/MusicCommunityPlayer/issues' target='_blank' className='absolute bottom-3 left-6 text-white hover:decoration-solid'>Signaler un problème</a>
      </div>
      <div className='flex md:w-1/2 justify-center py-10 items-center bg-white h-full'>
        <form className='bg-white w-3/4 max-w-96 min-w-80' onSubmit={handleSubmit}>
          <h1 className='text-gray-800 font-bold text-2xl mb-1'>Se connecter</h1>
          <p className='text-md font-normal text-gray-600 mb-7'>{!a2f ? ('Connectez-vous avec vos identifiants ED') : ("Répondez à la double authentification ED")}</p>
          {error != false && 
            <div className='flex items-center border-2 py-2 px-3 rounded-xl mb-4 h-full bg-red-400 border-red-400'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-black flex items-center' fill='none' viewBox='0 0 24 24' strokeWidth='2' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z' />
              </svg>
              <p className='pl-2 outline-none border-none w-full text-black'>{error}</p>
            </div>
          }
          {!a2f ? (
            <div>
              <div className={usernameFocus ? 'flex items-center border-2 py-2 px-3 rounded-xl mb-4 h-full border-gray-400' : 'flex items-center border-2 py-2 px-3 rounded-xl mb-4 h-full border-gray-200'}>
                <svg xmlns='http://www.w3.org/2000/svg' className={usernameFocus ? 'h-5 w-5 text-gray-500' : 'h-5 w-5 text-gray-400'} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'd='M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4' />
                </svg>
                <input className='pl-2 outline-none border-none w-full' type='username' placeholder='Identifiant' onFocus={handleUsernameFocus} onBlur={handleUsernameBlur} value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className={passwordFocus ? 'flex items-center border-2 py-2 px-3 rounded-xl mb-2 h-full border-gray-400' : 'flex items-center border-2 py-2 px-3 rounded-xl mb-2 h-full border-gray-200'}>
                <svg xmlns='http://www.w3.org/2000/svg' className={passwordFocus ? 'h-5 w-5 text-gray-500' : 'h-5 w-5 text-gray-400'} viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z' clipRule='evenodd' />
                </svg>
                <input className='pl-2 outline-none border-none w-full' type={visible ? 'text' : 'password'} placeholder='Mot de passe' onFocus={handlePasswordFocus} onBlur={handlePasswordBlur} value={password} onChange={(e) => setPassword(e.target.value)} />
                {visible ? (
                  <svg xmlns='http://www.w3.org/2000/svg' className={passwordFocus ? 'h-5 w-5 text-gray-500 cursor-pointer' : 'h-5 w-5 text-gray-400 cursor-pointer'} fill='none' viewBox='0 0 24 24' strokeWidth='2' stroke='currentColor' onClick={handlePasswordVisibility}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z' />
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                  </svg> 
                ) : (
                  <svg xmlns='http://www.w3.org/2000/svg' className={passwordFocus ? 'h-5 w-5 text-gray-500 cursor-pointer' : 'h-5 w-5 text-gray-400 cursor-pointer'} fill='none' viewBox='0 0 24 24' strokeWidth='2' stroke='currentColor' onClick={handlePasswordVisibility}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88' />
                  </svg>
                )}
              </div>
              <div className='flex items-center mx-1'>
                <div className='flex gap-x-0.5'>
                  <input type='checkbox' className='text-gray-600 cursor-pointer hover:bg' value={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <label className='text-gray-600 ml-2 '>Rester connecté</label>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className='class="block mb-2 text-sm font-medium text-gray-900 dark:text-white'>{question}</label>
              <select className={A2fFocus ? 'flex items-center border-2 py-2 px-3 rounded-xl mb-4 h-full border-gray-400 w-full focus-visible:outline-none pr-2' : 'flex items-center border-2 py-2 px-3 rounded-xl mb-4 h-full border-gray-200 w-full focus-visible:outline-none'} value={A2fSelection} onChange={(e) => setA2fSelection(e.target.value)} onFocus={handleA2fFocus} onBlur={handleA2fBlur}>
                <option key="default">Choisir une reponse</option>
                {propositions.map((proposition) => (
                  <option key={proposition}>{proposition}</option>
                ))}
              </select>
            </div>
          )}
          <div className='flex gap-2'>
            {a2f ? (
              <button type='button' className='block w-16 bg-gray-400 mt-4 py-2 rounded-xl text-white font-semibold mb-2' onClick={() => setA2f(false)}>⭠</button>
            ) : null}
            <button type='submit' className='block w-full bg-indigo-600 mt-4 py-2 rounded-xl text-white font-semibold mb-2'>Se connecter</button>
          </div>          
        </form>
        <a href={'https://github.com/MartinKoscianski/CommunityMusicPlayer/releases/tag/' + version} target='_blank' className='absolute bottom-3 right-6 md:hidden text-black text-s hover:decoration-solid'>v{version}</a>
        <a href='https://github.com/MartinKoscianski/MusicCommunityPlayer/issues' target='_blank' className='absolute bottom-3 left-6 md:hidden text-black text-s hover:decoration-solid'>Signaler un problème</a>
      </div>
    </div>
  );
}


async function EdLogin(username, password, a2f_info = false) {
  const api = 'https://api.ecoledirecte.com';
  const url = `/v3/login.awp`;
  const data = {
    identifiant: username,
    motdepasse: password,
  };
  if (a2f_info) {
    data.fa = [a2f_info];
  }
  try {
    const response = await axios.post(
      api + url, 
      `data=${JSON.stringify(data)}`
    );
    if(response.data.code == 200 ) {
      return {error: false, a2f: false, token: response.data.token, account: response.data.data.accounts[0]};
    } else if(response.data.code == 250) {
      return {error: false, a2f: true, token: response.data.token};
    } else {
      return {error: true, message: response.data.message};
    }
  } catch (error) {
    return {error: true, message: "Erreur : contactez le support"};
  }
}


async function edGetA2f(token) {
  const api = 'https://api.ecoledirecte.com';
  const url = '/v3/connexion/doubleauth.awp?verbe=get';
  const data = {};
  try {
    const response = await axios.post(
      api + url,
      `data=${JSON.stringify(data)}`,
      {
        headers: {
          "x-token": token,
          }
      } 
    );
    if(response.data.code === 200) {
      const question = decodeBase64(response.data.data.question);
      const propositions = []
      response.data.data.propositions.map((proposition) => {
        propositions.push(decodeBase64(proposition));
      });
      return {error: false, question: question, propositions: propositions};
    } else {
      return {error: true, message: response.data.message};
    }
  } catch (error) {
    return {error: true, message: "Erreur : contactez le support"};
  }
}

async function EdPostA2f(token, choix) {
  const api = 'https://api.ecoledirecte.com';
  const url = '/v3/connexion/doubleauth.awp?verbe=post';
  const data = {
    choix: btoa(choix)
  };
  try {
    const response = await axios.post(
      api + url,
      `data=${JSON.stringify(data)}`,
      {
        headers: {
          "x-token": token,
          }
      }
    );
    if(response.data.code === 200) {
      return {error: false, data: response.data.data};
    } else {
      return {error: true, message: response.data.message};
    }
  } catch (error) {
    return {error: true, message: "Erreur : contactez le support"};
  }
}


function decodeBase64(string) {
  const decodedText = atob(string);
  const bytes = new Uint8Array(decodedText.length);
  for (let i = 0; i < decodedText.length; i++) {
      bytes[i] = decodedText.charCodeAt(i);
  }
  const textDecoder = new TextDecoder('utf-8');
  const output = textDecoder.decode(bytes);
  return output;
}

export default LoginApp;