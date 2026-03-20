import React, { createContext, useContext, useEffect, useState } from 'react';

const PinContext = createContext();

export const usePin = () => useContext(PinContext);

export const PinProvider = ({ children }) => {
    const [pin, setPin] = useState(() => {
        // Retrieve the PIN from session storage
        return sessionStorage.getItem('userPin') || '';
    });

    useEffect(() => {
        // Store the PIN in session storage whenever it changes
        if (pin) {
            sessionStorage.setItem('userPin', pin);
        } else {
            sessionStorage.removeItem('userPin');
        }
    }, [pin]);

    const updatePin = (newPin) => {
        setPin(newPin);
    };

    const clearPin = () => {
        setPin('');
    };

    return (
        <PinContext.Provider value={{ pin, updatePin, clearPin }}>
            {children}
        </PinContext.Provider>
    );
};