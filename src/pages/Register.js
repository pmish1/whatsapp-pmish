import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import Login from './Login.js'
import {auth, db, storage} from '../Firebase'

import './Register.css'

import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'



function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [file, setFile] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const storageRef = ref(storage, username)
        try {
            //create the user 
            const response = await createUserWithEmailAndPassword(auth, email, password)
            
            //upload the profile image 
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    }
                }, 
                (error) => {
                    console.log(error)
                }, 
                () => {
                    //once upload successful, get the downloadURL and set it to the photoURL
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        //add the user to the DB
                        await setDoc(doc(db, "users", response.user.uid), {
                            displayName: username,
                            email, 
                            uid: response.user.uid,
                            photoURL: downloadURL
                        })
                    });
                    navigate('/home')
                }
            );
        }
        catch (error) {
            console.log(error)
        }

    }
    
  return (
    <div className='registerForm'>
        <form>
            <h1>Not WhatsApp</h1>
            <input type="text" placeholder='username' onChange={(e) => setUsername(e.target.value)}/>
            <input type="email" placeholder='email' onChange={(e) => setEmail(e.target.value)}/>
            <input type="password" placeholder='password' onChange={(e) => setPassword(e.target.value)}/>
            <input type="file" id="profilePic" onChange={(e) => setFile(e.target.files[0])} />
            <label htmlFor="profilePic">Add profile picture</label>

            <button type='submit' onClick={handleSubmit}>Register</button>
            
            <span>Already registered? <Link to="/login">Login</Link></span>

        </form>

    </div>
  )
}

export default Register