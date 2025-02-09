import { Button, Card,} from 'flowbite-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie'
import { useNavigate, useParams, Route, Routes} from 'react-router-dom'
import UserPageMain from './userpage';
import AdminPage from '../adminpage/adminpage';
import SMEPage from '../smepage/sme';
import NewWorkout from './newworkout.js';
import FindPlan from '../plans/findplan.js';
import History from '../history/history.js';
import SavedWorkouts from './SavedWorkouts.js';
import Logo from '../../images/logo2.png'



export default function UserPage() {

    const [exercises, setExercises] = useState([]);
    const [userData, setUserData] = useState([]);
    const [adminMode, setAdminMode] = useState(false);
    const [smeMode, setSmeMode] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null)
    const [contPlan, setContPlan] = useState(null)

    const Navigate = useNavigate()
    const token = Cookies.get('token')
    const user = useParams().username

    const getExercises = () => {
        try {
            fetch('http://localhost:8080/exercises', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            .then((res) => res.json())
            .then((data) => { setExercises(data) })
            .catch((err) => console.log(err))
        } catch (err) {
            console.log('Failed')
        }
    }

    useEffect(() => {
        if (!token) {
            Navigate('/')
        } else {
            try {
                fetch(`http://localhost:8080/user/${user}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(res => {
                        if (!res.ok) {
                            Navigate('/')
                        } else {
                            return res.json()
                        }
                    })
                    .then(data => {
                        setUserData(data)
                        Cookies.set('userId', data[0].id)
                        Cookies.set('user_name', data[0].user_name)
                        getExercises();
                    })
            } catch (err) {
                console.error('Failed to fetch')
            }
        }
    }, [token, user,])


    if (userData.length < 1 || exercises.length < 1) {
        return <p>Loading....</p>
    }
    return (
        <>
            <header className='w-full h-20'>
                <Card>
                    <div className="flex items-center justify-between">
                        <h1 className="w-fit text-2xl font-semibold cursor-pointer" onClick={()=> {setContPlan(null);
                            setSelectedWorkout(null); Navigate(`/user/${userData[0].user_name}`)}}><img src={Logo} alt="logo" width="50"/>Bits4Fits</h1>
                        <div className="flex gap-10">
                            {userData[0].role_id === 1
                                ?
                                (adminMode
                                    ?
                                    <Button className="w-40" onClick={() => { setAdminMode(false); Navigate(`/user/${userData[0].user_name}`) }}>Home</Button>
                                    :
                                    <Button className="w-40" onClick={() => { setAdminMode(true); Navigate('adminTools') }}>Admin Tools</Button>)
                                :
                                userData[0].role_id === 3
                                    ?
                                    (smeMode
                                        ?
                                        <Button className="w-40" onClick={() => { setSmeMode(false); Navigate(`/user/${userData[0].user_name}`) }}>Home</Button>
                                        :
                                        <Button className="w-40" onClick={() => { setSmeMode(true); Navigate('governator') }}>Governate</Button>)
                                    : null

                                    // <Button className="w-40" onClick={() => { Navigate(`/user/${userData[0].user_name}`) }}>Home</Button>
                            }
                            <Button className="w-40" onClick={() => { Cookies.remove('token'); Cookies.remove('user_name'); Cookies.remove('userId'); Navigate('/') }}>Sign Out</Button>

                        </div>
                    </div>
                </Card>
            </header>
            <div className="flex  flex-col mt-10">
            <Routes>
                <Route path='/' element={<UserPageMain userData={userData} exercises={exercises} setContPlan={setContPlan}/>} />
                <Route path='adminTools' element={<AdminPage />} />
                <Route path='governator' element={<SMEPage />} />
                <Route path='newWorkout' element={<NewWorkout exercises={exercises} userData={userData} selectedWorkout={selectedWorkout} contPlan={contPlan}/>} />
                <Route path='findPlan/*' element={<FindPlan />} />
                <Route path='history' element={<History />} />
                <Route path='savedworkouts' element={<SavedWorkouts setSelectedWorkout={setSelectedWorkout} />} />
            </Routes>
            </div>
        </>
    )
}