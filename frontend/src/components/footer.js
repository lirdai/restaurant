import React from 'react'



const Footer = () => {
  const LOCATOR = "290 Bremner Blvd, Toronto, ON"

  return (
    <div className='footer'>
       {/* Introduction: map/pictures....*/}
       <div className='footer-map'>
        {/* Map */}
        <iframe
          title='googleMap'
          frameBorder="0"
          className='map'
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_API}&q=${LOCATOR}`} allowFullScreen>
        </iframe>
      </div>
      
      <div className='footer-intro'>
        <h3 className='pb-3'>Office Hours</h3>
        <p>Monday - Thursday: 7:00 a.m. ~ 3:00 p.m. </p>
        <p className='pb-5'>Friday - Sunday: 9:00 a.m. ~ 5:00 p.m. </p>
        <p>	&copy; Created by Daisy Dai</p>
        <p>Created on 11/18/2020</p>
      </div>
    </div>
  )
}
  


export default Footer