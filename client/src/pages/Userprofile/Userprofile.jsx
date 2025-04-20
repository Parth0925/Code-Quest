import React, { useState, useEffect } from 'react'
import Leftsidebar from '../../Components/Leftsidebar/Leftsidebar'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import Avatar from '../../Components/Avatar/Avatar'
import Editprofileform from './Edirprofileform'
import Profilebio from './Profilebio'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBirthdayCake, faPen } from '@fortawesome/free-solid-svg-icons'
import { getUserSettings, updateUserSettings } from '../../action/users';

const Userprofile = ({ slidein }) => {
  const { id } = useParams()
  const [Switch, setswitch] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const users = useSelector((state)=>state.usersreducer)
  const currentprofile = users.filter((user) => user._id === id)[0]
  const currentuser = useSelector((state)=>state.currentuserreducer)
  // console.log(currentuser._id)

  useEffect(() => {
    // Fetch user's notification preference from backend
    const fetchUserSettings = async () => {
      const settings = await getUserSettings();
      setNotificationsEnabled(settings.notificationsEnabled);
    };
    fetchUserSettings();
  }, []);

  const handleNotificationToggle = async () => {
    // Update user settings for notifications
    await updateUserSettings({ notificationsEnabled: !notificationsEnabled });
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="home-container-1">
      <Leftsidebar slidein={slidein} />
      <div className="home-container-2">
        <section>
          <div className="user-details-container">
            <div className="user-details">
              <Avatar backgroundColor="purple" color="white" fontSize="50px" px="40px" py="30px">{currentprofile.name.charAt(0).toUpperCase()}</Avatar>
              <div className="user-name">
                <h1>{currentprofile?.name}</h1>
                <p>
                  <FontAwesomeIcon icon={faBirthdayCake} /> Joined{" "} {moment(currentprofile?.joinedon).fromNow()}
                </p>
              </div>
            </div>
            {currentuser?.result?._id === id && ( 
              <button className="edit-profile-btn" type='button' onClick={() => setswitch(true)}><FontAwesomeIcon icon={faPen} /> Edit Profile</button>
            )}
          </div>
          <>
            {Switch ? (
              <Editprofileform currentuser={currentuser} setswitch={setswitch} />
            ) : (
              <Profilebio currentprofile={currentprofile} />
            )}
          </>
          <label>
        Enable Notifications
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={handleNotificationToggle}
        />
      </label>
        </section>
      </div></div>
  )
}

export default Userprofile