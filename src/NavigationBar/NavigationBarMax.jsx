import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./navigationBarMax.css";
import { useRoleId } from "../js/Utilits/roleId.js";

const NavigationBarMax = (
    {onShowMax, onHideMax, isNavMaxVisible}
) => {
    const location = useLocation();
    const navigate = useNavigate();
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
        <div className="navigation-bar-max">
            <div className="navigation-bar-max__top-block">
                <div className="navigation-bar-max__logo-block">
                    <img src="../../images/logo/header_logo_1280.svg" alt="Логотип системы" className="navigation-bar-min__logo" />
                </div>
                <div className="top-block__line navigation-bar-max__top-block__line"></div>
                <ul className="navigation-bar-max__navigation-list">
                    {(roleCustomer || roleAdmin) && (
                        <>              
                            <li
                                className={`navigation-bar-max__navigation-item ${location.pathname === pathApplicationPanel ? 'navigation-bar-max__navigation-item_active' : ''}`}
                                onClick={() => navigate(pathApplicationPanel)}
                            >
                                <img src="../../images/icon/inform-panel-icon_off.svg" className="nbm-navigation-item__icon" alt="#"/>
                                <div className="nbm-navigation-item__name">Дашборд</div>
                            </li>
                            <li
                                className={`navigation-bar-max__navigation-item ${location.pathname === pathSuppliersOffers ? 'navigation-bar-max__navigation-item_active' : ''}`}
                                onClick={() => navigate(pathSuppliersOffers)}
                            >
                                <img src="../images/icon/nomenclature-icon_off.svg" className="nbm-navigation-item__icon" alt="#"/>
                                <div className="nbm-navigation-item__name">Номенклатура</div>
                            </li>
                            <li
                                className={`navigation-bar-max__navigation-item ${location.pathname === pathEditSupplyComponent ? 'navigation-bar-max__navigation-item_active' : ''}`}
                                onClick={() => navigate(pathEditSupplyComponent)}
                            >
                                <img src="../images/icon/edit-nomenclature-icon_off.svg" className="nbm-navigation-item__icon" alt="#" />
                                <div className="nbm-navigation-item__name">Редактирование</div>
                            </li>
                            <li
                                className={`navigation-bar-max__navigation-item ${location.pathname === pathAddComponent ? 'navigation-bar-max__navigation-item_active' : ''}`}
                                onClick={() => navigate(pathAddComponent)}
                            >
                                <img src="../images/icon/add-nomenclature-icon_off.svg" className="nbm-navigation-item__icon" alt="#"/>
                                <div className="nbm-navigation-item__name">Добавить данные</div>
                            </li>
                            <li
                                className={`navigation-bar-max__navigation-item ${location.pathname === pathPurchase ? 'navigation-bar-max__navigation-item_active' : ''}`}
                                onClick={() => navigate(pathPurchase)}
                            >
                                <img src="../images/icon/specification-icon_off.svg" className="nbm-navigation-item__icon" alt="#"/>
                                <div className="nbm-navigation-item__name">Спецификации</div>
                            </li>                   
                        </>
                    )}
                </ul>
            </div>
            <div className="navigation-bar-max__bootom-block">                
                <div className="fice-lodo-block">
                    <img src="../images/user_logo_max-baner.png" alt="Логотип пользователя" />
                </div>
                <div className="bottom-block__navigation-arrow bottom-block__navigation-arrow_open">
                    {!isNavMaxVisible && (
                        <img
                            src="../images/icon/burger-icon-open.svg"
                            alt="Показать панель"
                            className="navigation-arrow-img"
                            id="arrow-right"
                            onClick={onShowMax}
                            style={{ cursor: "pointer" }}
                        />
                    )}
                    {isNavMaxVisible && (
                        <img
                            src="../images/icon/burger-icon-open.svg"
                            alt="Скрыть панель"
                            className="navigation-arrow-img"
                            id="arrow-left"
                            onClick={onHideMax}
                            style={{ cursor: "pointer" }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavigationBarMax;