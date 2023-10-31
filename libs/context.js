import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password); // return a promise
    }

    const login = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password);
    };

    const logout = () => {
        return auth.signOut();
    };

    const resetPassword = (email) => {
        return auth.sendPasswordResetEmail(email);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {


            if (user) {
                // added event listener
                setCurrentUser(user);
                setDisplayName(user.displayName)
                setEmail(user.email)
            }
            setLoading(false);

        });
        return unsubscribe;
    }, []);

    const [currentUser, setCurrentUser] = useState();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const value = {
        currentUser,
        displayName,
        email,
        signup,
        login,
        logout,
        resetPassword,
    };
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
