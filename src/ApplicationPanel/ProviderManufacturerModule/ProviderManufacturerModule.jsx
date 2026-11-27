import React from "react";
import { useState } from "react";
import Manufacturer from "./Manufacturer.jsx";
import ProviderList from "./ProviderList.jsx";
import ApiUrl from "../../js/ApiUrl.js";



/// Модуль информации - добавляет и выводит 
// информацию в связке компания поставщик и наименование производителя которого поставляет эта компания.


const ProviderManufacturerModule  = (
    {
        providerManufacturerList,
        panelProviderManufacturer,
        providerManufacturerInfo,
        setGuidIdManufacturer,
        setProviderManufacturerInfo, 
        setProviderManufacturerList,
        addProviderManufacturer
    }
) => {

        // Идентификаторы выбранных производителя и поставщика
        const [selectedGuidMan, setSelectedGuidMan] = useState(''); // Идентификатор выбранного производителя
        const [selectedGuidProvider, setSelectedGuidProvider] = useState(''); // Идентификатор выбранного поставщика
        const [loading, setLoading] = useState(false);

        // Собственно сама функция записи связки поставщика и проиозводителя
        const addRecordProviderManufacturer = async () => {
            setLoading(true);
            const request = {
                guidIdManufacturer: selectedGuidMan,
                guidIdProvider: selectedGuidProvider
            };

            try {
                const response = await fetch(`${ApiUrl}/v1/AddRecordProviderManufacturer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Данные ушли:", data.message);
                } else {
                    console.error("Ошибка сервера:", response.status);
                }
            } catch (error) {
                console.error("Ошибка при отправке данных:", error);
            } finally {
                setLoading(false);
            }
        };


    return (
        <>
            {/* Блок с информацией о Поставщиках определенного производителя*/}
            {panelProviderManufacturer?
                <>
                    <div className="loading-data-from-1C-block">
                        <div
                        className="pagination-icon-block__icon pagination-icon-block__add-icon cpib__plus-button"
                        onClick={()=>addProviderManufacturer()}
                        >
                        -
                        </div>
                        <h5 className="cpib__title"> Поставщики производителя:</h5>
                        <div className="col g-3" style={{marginBottom: '10px', paddingRight: "10px"}}>
                            <div class="col mb-2">
                                <div>Производитель:</div>
                                <Manufacturer 
                                    setSelectedGuidMan = {setSelectedGuidMan}
                                    setGuidIdManufacturer={setGuidIdManufacturer} 
                                    setProviderManufacturerInfo={setProviderManufacturerInfo} 
                                    setProviderManufacturerList={setProviderManufacturerList} 
                                />
                            </div>
                            <div class="col mb-4">
                                <div>Поставщик:</div>
                                <ProviderList 
                                    setSelectedGuidProvider = {setSelectedGuidProvider}
                                />
                            </div>
                            {!loading ?
                                <>
                                    <button 
                                        style={{width: "100%"}} 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={()=>addRecordProviderManufacturer()}
                                    >Записать</button>
                                </>
                            : <p>Запись переданных данных...</p>}
                       
                        </div>
                    </div>
                </>:
                <>
                    <div className="loading-data-from-1C-block">
                        <div
                            className="pagination-icon-block__icon pagination-icon-block__add-icon cpib__plus-button"
                            onClick={()=>addProviderManufacturer()}
                        >
                            +
                        </div>
                        <h5 className="cpib__title"> Поставщики производителя:</h5>
                        <Manufacturer 
                            setSelectedGuidMan = {setSelectedGuidMan}
                            setGuidIdManufacturer={setGuidIdManufacturer} 
                            setProviderManufacturerInfo={setProviderManufacturerInfo} 
                            setProviderManufacturerList={setProviderManufacturerList} 
                        />
                    </div>
                </>}


            {providerManufacturerInfo?
                <>
                <br/>
                    <div className="collaborator-provider-info-block__collaborator-info">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" style={{borderTopLeftRadius:"10px"}}></th>
                                    <th scope="col">Наименование компаниии</th>
                                    <th scope="col" style={{borderTopRightRadius: "10px"}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {providerManufacturerList.map((item) => (
                                    <tr key={1}>
                                        <td></td>
                                        <td>{item.nameProvider}</td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>:<></>}
        </>
    );
}


export default ProviderManufacturerModule;