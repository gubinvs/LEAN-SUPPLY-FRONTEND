import React from "react";
import { useRoleId } from "../js/Utilits/roleId.js";
import { useLocation } from 'react-router-dom';
import "./navigationBarMin.css";
import {
    linkPageAddComponent,
    linkPageApplicationPanel, 
    suppliersOffers,
    linkPageEditSupplyComponent,
    linkPagePurchase,
    linkPageOrders
} from "../js/linkPage.js";


const NavigationBarMin = (
    { onShowMax, onHideMax, isNavMaxVisible }
) => {

    // состояни роли пользователя в системе
    const location = useLocation();
    const { roleCustomer, roleProvider, roleAdmin, roleUser } = useRoleId();

    // Пути
    let pathApplicationPanel = "";
    const pathSuppliersOffers = "/SuppliersOffers";
    const pathAddComponent = "/AddComponentApplication";
    const pathEditSupplyComponent = "/EditSupplyComponent";
    const pathPurchase = "/Purchase";
    const pathOrders = "/OrdersPage";

    if (roleAdmin) {
        pathApplicationPanel = "/ApplicationPanelAdmin";
    } else if (roleUser || roleCustomer) {
        pathApplicationPanel = "/ApplicationPanelCustomer";
    } else if (roleProvider) {
        pathApplicationPanel = "/ApplicationPanelProvider";
    }
    

    return (
        <div className="navigation-bar-min">
            <div className="navigation-bar-min__top-block">
                <picture>
                    <img src="../../images/logo/header_logo_1280.svg" alt="Логотип системы" className="navigation-bar-min__logo" />
                </picture>
                <div className="top-block__line"></div>
                <ul className="navigation-icon-block">
                    {/* Если роль пользователя заказчик*/}
                    {roleCustomer || roleAdmin ?
                        <>
                            <li className="navigation-icon-block__item" onClick={linkPageApplicationPanel}>
                                <img 
                                    className="navigation-icon__icon-img" 
                                    // src="../images/icon/inform-panel-icon__big_off.svg" 
                                    src={location.pathname === pathApplicationPanel ? "../images/icon/dachbord__icon-big_on.svg" : "../images/icon/dachbord__icon-big_off.svg"}
                                    alt="#" 
                                />
                            </li>
                            <li className="navigation-icon-block__item" onClick={suppliersOffers}>
                                <img 
                                    className="navigation-icon__icon-img" 
                                    // src="../images/icon/nomenclature-icon__big_off.svg"
                                    src={location.pathname === pathSuppliersOffers ? "../images/icon/nomenclature__icon__big_on.svg" : "../images/icon/nomenclature-icon__big_off.svg"}
                                    alt="#" 
                                />
                            </li>
                            <li className="navigation-icon-block__item" onClick={linkPageEditSupplyComponent}>
                                <img 
                                    className="navigation-icon__icon-img" 
                                    // src="../images/icon/edit-nomenclature-icon__big_off.svg" 
                                    src={location.pathname === pathEditSupplyComponent ? "../images/icon/edit-nomenclature-icon__big_on.svg" : "../images/icon/edit-nomenclature-icon__big_off.svg"}
                                    alt="#" 
                                />
                            </li>
                            <li className="navigation-icon-block__item" onClick={linkPageAddComponent}>
                                <img 
                                    className="navigation-icon__icon-img" 
                                    // src="../images/icon/add-nomenclature-icon__big_off.svg" 
                                    src={location.pathname === pathAddComponent ? "../images/icon/add-nomenclature-icon__big_on.svg" : "../images/icon/add-nomenclature-icon__big_off.svg"}
                                    alt="#" 
                                />
                            </li>
                            <li className="navigation-icon-block__item" onClick={linkPagePurchase}>
                                <img 
                                    className="navigation-icon__icon-img" 
                                    // src="../images/icon/specifications-icon__big_off.svg" 
                                    src={location.pathname === pathPurchase ? "../images/icon/specifications-icon__big_on.svg" : "../images/icon/specifications-icon__big_off.svg"}
                                    alt="#" />
                            </li>
                        </>
                    :""}
                    
                    {/* Если роль пользователя поставщик! */}
                    {roleProvider?"":""}
                </ul>
            </div>
            <div className="navigation-bar-min__bootom-block">
                <div className="bottom-block__navigation-arrow">
                    {!isNavMaxVisible && (
                        <img
                            src="../images/icon/burger-icon-off.svg"
                            alt="Показать панель"
                            className="navigation-arrow-img"
                            id="arrow-right"
                            onClick={onShowMax}
                            style={{ cursor: "pointer" }}
                        />
                    )}
                    {isNavMaxVisible && (
                        <img
                            src="../images/icon/burger-icon-on.svg"
                            alt="Скрыть панель"
                            className="navigation-arrow-img"
                            id="arrow-left"
                            onClick={onHideMax}
                            style={{ cursor: "pointer" }}
                        />
                    )}
                </div>
                <div className="fice-lodo-block">
                    <img src="../images/user_logo_max-baner.png" alt="Логотип пользователя" />
                </div>
            </div>
        </div>
    );
};

export default NavigationBarMin;
