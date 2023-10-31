

import React from "react";
import { useAuth } from "../libs/context";
import { Row, Col, Button } from 'react-bootstrap'
import { signOut } from "firebase/auth";
import { auth } from "../firebase"
import { useRouter } from 'next/router'

export default function Account() {
    const router = useRouter()

    const handleSignout = () => {
        signOut(auth)
        window.location.href = '/'

    }


    const { displayName, email } = useAuth()
    return (<>
        {displayName &&
            < Row >
                <Col className="account">
                    <h3>Name </h3>
                    {displayName}
                    <h3> Email </h3>
                    {email}
                    <div className="spacing"></div>
                    <Button onClick={handleSignout}>
                        Sign Out
                    </Button>
                </Col>
            </Row >
        }
    </>
    )
}