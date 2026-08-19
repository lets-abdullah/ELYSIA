import React from 'react';
import { HotelProvider } from './context/HotelContext';
import { HotelErpApp } from './components/erp/HotelErpApp';

export default function App() {
  return (
    <HotelProvider>
      <HotelErpApp />
    </HotelProvider>
  );
}
