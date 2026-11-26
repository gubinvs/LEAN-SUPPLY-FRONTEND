import React, { useState, useEffect, useMemo } from "react";
import ApiUrl from "../js/ApiUrl.js";
import { useRoleId } from "../js/Utilits/roleId.js";
import "./allOffersForSelected.css";
import NavigationBarMin from "../NavigationBar/NavigationBarMin.jsx";
import NavigationBarMax from "../NavigationBar/NavigationBarMax.jsx";
import HeaderApplicationPanel from "../ApplicationPanel/Header/HeaderApplicationPanel.jsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PaginationPage from "../ElementApplication/PaginationPage.jsx";

const AllOffersForSelected = ({ role, title }) => {
  const { roleCustomer, roleProvider, roleAdmin, roleUser } = useRoleId();
  
  const [isNavMaxVisible, setIsNavMaxVisible] = useState(false);
  const [analyzedComponents, setAnalyzedComponents] = useState([]);
  
  // Данные для режима "Все предложения"
  const [combinedOffers, setCombinedOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Данные для режимов "Лучшие" (приходят готовыми с API)
  const [bestPriceData, setBestPriceData] = useState([]);
  const [bestTimeData, setBestTimeData] = useState([]);
  const [loadingBest, setLoadingBest] = useState(false);

  const [selectedVendorCodes, setSelectedVendorCodes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 1000000;
  const [totalPages, setTotalPage] = useState(1);

  // 'all' | 'price' | 'time'
  const [viewMode, setViewMode] = useState('all');

  const handleShowMax = () => setIsNavMaxVisible(true);
  const handleHideMax = () => setIsNavMaxVisible(false);

  // 1. Загрузка всех предложений (для режима 'all')
  useEffect(() => {
    const analyzeData = JSON.parse(localStorage.getItem("analyzeData") || "{}");
    const selected = analyzeData.selectedComponents || [];
    setAnalyzedComponents(selected);

    const fetchData = async () => {
      setLoading(true);
      const articleList = selected
        .map((comp) => comp.vendorCodeComponent)
        .filter((a) => a && a.trim().length > 0);

      if (articleList.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${ApiUrl}/api/ReturnPriceProviderListArticle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Articles: articleList })
        });

        if (!response.ok) throw new Error("Ошибка загрузки данных цен");
        const data = await response.json();

        const allOffersApi = [];
        data.found.forEach((component) => {
          component.offers.forEach((offer) => {
            allOffersApi.push({
              ...offer,
              vendorCode: component.article,
              nameComponent: component.nameComponent,
            });
          });
        });

        const selectedMap = new Map(selected.map(item => [item.vendorCodeComponent, item.quantity]));
        const allOffers = allOffersApi.map(item => ({
          ...item,
          quantity: selectedMap.get(item.vendorCode) ?? item.quantity,
        }));

        const responseEntryPurchase = await fetch(`${ApiUrl}/api/ReturnListEntryPurchasePrice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Articles: articleList })
        });

        if (responseEntryPurchase.ok) {
          const dataEntryPurchase = await responseEntryPurchase.json();
          const allOffersAllPurchase = allOffers.map(item => {
            const matches = dataEntryPurchase.filter(x => x.article === item.vendorCode);
            return { ...item, entryPurchase: matches };
          });
          setCombinedOffers(allOffersAllPurchase);
        } else {
          setCombinedOffers(allOffers);
        }

      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selected.length > 0) fetchData();
  }, []);

  // 2а. Загрузка "Лучших по цене" (срабатывает только при viewMode === 'price')
  useEffect(() => {
    if (viewMode !== 'price' || analyzedComponents.length === 0) return;

    const fetchBestPriceData = async () => {
      setLoadingBest(true);
      try {
        const articleList = analyzedComponents
          .map((comp) => comp.vendorCodeComponent)
          .filter((a) => a && a.trim().length > 0);

        if (articleList.length === 0) {
          setLoadingBest(false);
          return;
        }

        const response = await fetch(`${ApiUrl}/api/ReturnBestPriceProviderListArticle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Articles: articleList })
        });

        if (!response.ok) throw new Error("Ошибка загрузки лучших цен");
        const data = await response.json();
        setBestPriceData(data);

      } catch (error) {
        console.error("Ошибка при загрузке лучших цен:", error);
      } finally {
        setLoadingBest(false);
      }
    };

    fetchBestPriceData();
  }, [viewMode, analyzedComponents]);

  // 2б. Загрузка "Лучших по сроку" (срабатывает только при viewMode === 'time')
  useEffect(() => {
    if (viewMode !== 'time' || analyzedComponents.length === 0) return;

    const fetchBestTimeData = async () => {
      setLoadingBest(true);
      try {
        const articleList = analyzedComponents
          .map((comp) => comp.vendorCodeComponent)
          .filter((a) => a && a.trim().length > 0);

        if (articleList.length === 0) {
          setLoadingBest(false);
          return;
        }

        const response = await fetch(`${ApiUrl}/api/ReturnBestTimeProviderListArticle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Articles: articleList })
        });

        if (!response.ok) throw new Error("Ошибка загрузки лучших сроков");
        const data = await response.json();
        setBestTimeData(data);

      } catch (error) {
        console.error("Ошибка при загрузке лучших сроков:", error);
      } finally {
        setLoadingBest(false);
      }
    };

    fetchBestTimeData();
  }, [viewMode, analyzedComponents]);


  const toggleVendorSelection = (vendorCode) => {
    setSelectedVendorCodes((prev) => {
      const newSet = new Set(prev);
      newSet.has(vendorCode) ? newSet.delete(vendorCode) : newSet.add(vendorCode);
      return newSet;
    });
  };

  const filteredOffers = useMemo(() => {
    return selectedVendorCodes.size > 0
      ? combinedOffers.filter((o) => selectedVendorCodes.has(o.vendorCode))
      : combinedOffers;
  }, [combinedOffers, selectedVendorCodes]);

  useEffect(() => {
    setTotalPage(Math.ceil(filteredOffers.length / rowsPerPage));
  }, [filteredOffers.length, rowsPerPage]);

  // --- Функции экспорта в Excel ---

  const exportToExcel = () => {
    const data = filteredOffers.map((offer) => ({
      Артикул: offer.vendorCode,
      Наименование: offer.nameComponent,
      Компания: offer.nameProvider,
      Цена: offer.priceComponent,
      Срок: offer.deliveryTimeComponent,
      Актуальность: new Date(offer.saveDataPrice).toLocaleDateString("ru-RU"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 20 }, { wch: 11 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Предложения");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "Предложения.xlsx");
  };

  const exportBestByProviderToExcel = () => {
    const data = bestPriceData.map((item) => ({
      Артикул: item.article || "Не указан",
      Наименование: item.nameComponent || "Не указано",
      Компания: item.offer?.nameProvider || "Неизвестно",
      Цена: item.offer?.priceComponent || 0,
      Срок: item.offer?.deliveryTimeComponent || "Не указан",
      Актуальность: item.offer?.saveDataPrice ? new Date(item.offer.saveDataPrice).toLocaleDateString("ru-RU") : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 20 }, { wch: 11 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Лучшие по цене");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "ЛучшиеПоЦене.xlsx");
  };

  const exportFastestDeliveryProviderToExcel = () => {
    const data = bestTimeData.map((item) => ({
      Артикул: item.article || "Не указан",
      Наименование: item.nameComponent || "Не указано",
      Компания: item.offer?.nameProvider || "Неизвестно",
      Цена: item.offer?.priceComponent || 0,
      Срок: item.offer?.deliveryTimeComponent || "Не указан",
      Актуальность: item.offer?.saveDataPrice ? new Date(item.offer.saveDataPrice).toLocaleDateString("ru-RU") : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 20 }, { wch: 11 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Лучшие по сроку");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "ЛучшиеПоСроку.xlsx");
  };

  // --- Рендеринг строк таблицы ---

  const renderRows = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    // Массив уже отсортирован по артикулу
    const paginated = [...filteredOffers]
      .sort((a, b) => a.vendorCode.localeCompare(b.vendorCode))
      .slice(startIndex, startIndex + rowsPerPage);

    let prevVendor = null;
    let prevName = null;

    return paginated.map((offer, index) => {
      const isFirstOccurrence = offer.vendorCode !== prevVendor || offer.nameComponent !== prevName;
      if (isFirstOccurrence) {
        prevVendor = offer.vendorCode;
        prevName = offer.nameComponent;
      }

      // Определяем, является ли это предложение ПОСЛЕДНИМ для данного артикула
      const nextOffer = paginated[index + 1];
      const isLastForVendor = !nextOffer || nextOffer.vendorCode !== offer.vendorCode;
      
      return (
        <React.Fragment key={`fragment-${offer.vendorCode}-${offer.nameProvider}-${index}`}>
          {isFirstOccurrence && (
            <tr key={`main-${offer.vendorCode}-${index}`}>
              <td>   
                <input
                  type="checkbox"
                  checked={selectedVendorCodes.has(offer.vendorCode)}
                  onChange={() => toggleVendorSelection(offer.vendorCode)}
                />
              </td>
              <td>{offer.vendorCode}</td>
              <td colSpan={5}>{offer.nameComponent}</td>
            </tr>
          )}
          
          <tr key={`offer-${offer.vendorCode}-${offer.nameProvider}-${index}`}>
            <td style={{ width: "20px" }}></td>
            <td colSpan={2} style={{ textAlign: "right" }}>предложение</td>
            <td>
              {roleAdmin || roleCustomer ? (
                <a href="http://192.168.1.43" target="_blank" rel="noopener noreferrer">
                  {offer.nameProvider}
                </a>
              ) : (
                offer.nameProvider
              )}
            </td>
            <td>{offer.priceComponent.toLocaleString("ru-RU")} ₽</td>
            <td>{offer.deliveryTimeComponent}</td>
            <td>{new Date(offer.saveDataPrice).toLocaleDateString("ru-RU")}</td>
          </tr>
          {/* Пустая строка после данных если ниже нет данных о оприходвании */}
          {isLastForVendor && offer.entryPurchase?.[0] === undefined ? <tr><td colSpan={7}></td></tr>:""}


          {/* Выводим оприходование ТОЛЬКО после последнего предложения артикула */}
          {isLastForVendor && offer.entryPurchase?.[0] && (
            <>
              <tr key={`purchase-${offer.vendorCode}-${index}`} className="table-info_1">
                <td style={{ width: "20px" }}></td>              
                <td colSpan={2} style={{ textAlign: "right" }}>Последняя покупка из 1С:</td>
                <td>{offer.entryPurchase[0].nameProvider}</td>
                <td>{offer.entryPurchase[0].purchasePrice.toLocaleString("ru-RU")} ₽</td>
                <td>Оприходован</td>
                <td>{new Date(offer.entryPurchase[0].saveDataPrice).toLocaleDateString("ru-RU")}</td>
              </tr>
              <tr>
                <td colSpan={7}></td>              
              </tr>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  // Вспомогательная функция для рендера таблиц "Лучшие"
  const renderBestTable = (data) => {
    if (!data || data.length === 0) return <p className="text-muted">Нет данных для отображения.</p>;

    const totalPrice = data.reduce((sum, item) => sum + (item.offer?.priceComponent || 0), 0);

    return (
      <table className="table table-bordered all-offers-selected__table">
        <thead className="thead-light">
          <tr>
            <th className="aos-table__th-article">Артикул</th>
            <th>Наименование</th>
            <th className="aos-table__th-company">Компания</th>
            <th className="aos-table__th-price">Цена</th>
            <th className="aos-table__th-term">Срок</th>
            <th className="aos-table__th-data">Актуальность</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.article || "Не указан"}</td>
              <td>{item.nameComponent || "Не указано"}</td>
              <td>
                {roleAdmin || roleCustomer ? (
                  <a href="http://192.168.1.43" target="_blank" rel="noopener noreferrer">
                    {item.offer?.nameProvider || "Неизвестно"}
                  </a>
                ) : (
                  item.offer?.nameProvider || "Неизвестно"
                )}
              </td>
              <td>{(item.offer?.priceComponent || 0).toLocaleString("ru-RU")} ₽</td>
              <td>{item.offer?.deliveryTimeComponent || "Не указан"}</td>
              <td>
                {item.offer?.saveDataPrice 
                  ? new Date(item.offer.saveDataPrice).toLocaleDateString("ru-RU") 
                  : "-"}
              </td>
            </tr>
          ))}
          {/* <tr className="table-active">
            <td colSpan={3}><b>Итого (по выбранным позициям)</b></td>
            <td colSpan={3}><b>{totalPrice.toLocaleString("ru-RU")} ₽</b></td>
          </tr> */}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="main-application-panel">
        <NavigationBarMin onShowMax={handleShowMax} onHideMax={handleHideMax} isNavMaxVisible={isNavMaxVisible} />
        {isNavMaxVisible && (
          <NavigationBarMax onShowMax={handleShowMax} onHideMax={handleHideMax} isNavMaxVisible={isNavMaxVisible} />
        )}
        <HeaderApplicationPanel role={role} title={title} />
      </div>

      <div className="main-application-panel__container">
        <div className="all-offers-selected__container">
          {analyzedComponents.length === 0 ? (
            <p>Нет выбранных компонентов для анализа.</p>
          ) : loading ? (
            <div className="custom-spinner-container"><div className="custom-spinner"></div></div>
          ) : combinedOffers.length === 0 && viewMode === 'all' ? (
            <p className="text-muted">Нет предложений.</p>
          ) : (
            <>
              <div className="mb-4 all-offers-selected__button-block d-flex justify-content-between align-items-center">
                <div>
                  {viewMode !== 'all' && (
                    <button className="btn btn-outline-secondary mr-10" onClick={() => setViewMode('all')}>
                      Назад к полному списку
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-success mx-2" onClick={exportToExcel}>
                    Скачать все (Excel)
                  </button>
                  <button className="btn btn-sm btn-outline-success mx-2" onClick={exportBestByProviderToExcel}>
                    Скачать лучшие по цене (Excel)
                  </button>
                  <button className="btn btn-sm btn-outline-success" onClick={exportFastestDeliveryProviderToExcel}>
                    Скачать лучшие по сроку (Excel)
                  </button>
                </div>
                
                <div className="all-offers-selected__button-select-block">
                  <button
                    className={`btn ml-2 ${viewMode === 'price' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('price')}
                  >
                    Лучшие по цене
                  </button>
                  <button
                    className={`btn ml-2 ${viewMode === 'time' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('time')}
                  >
                    Лучшие по сроку
                  </button>
                </div>
              </div>

              {viewMode === 'all' ? (
                <table className="table table-bordered all-offers-selected__table">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="aos-table__th-article">Артикул</th>
                      <th>Наименование</th>
                      <th className="aos-table__th-company">Компания</th>
                      <th className="aos-table__th-price">Цена</th>
                      <th className="aos-table__th-term">Срок</th>
                      <th className="aos-table__th-data">Актуальность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRows()}
                  </tbody>
                </table>
              ) : loadingBest ? (
                <div className="custom-spinner-container"><div className="custom-spinner"></div></div>
              ) : (
                renderBestTable(viewMode === 'price' ? bestPriceData : bestTimeData)
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AllOffersForSelected;