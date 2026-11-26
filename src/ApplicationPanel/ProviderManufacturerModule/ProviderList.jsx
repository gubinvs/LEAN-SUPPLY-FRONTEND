import React, { useState, useRef, useEffect } from 'react';
import "../InformationPanel/informationPanel.css";
import "../applicationPanel.css";
import "../InformationPanel/dataCollaborator.css";
import "../InformationPanel/informationCompanyCard.css";
import ApiUrl from "../../js/ApiUrl.js";
// Если у вас есть аналогичный обработчик для поставщиков, раскомментируйте и укажите правильный путь:
// import { handleSelectProviderChange } from "../../js/Utilits/handleSelectProviderChange.js";

// Компонент списка поставщиков с поиском по тексту
const ProviderList = ({ setGuidIdProvider, setProviderInfo, setProviderList }) => {
    // Состояния для работы с данными
    const [providers, setProviders] = useState([]); // Массив поставщиков из БД
    const [searchTerm, setSearchTerm] = useState(''); // Текст поиска
    const [isOpen, setIsOpen] = useState(false); // Открытие списка
    const [selectedName, setSelectedName] = useState(''); // Имя выбранного поставщика

    const dropdownRef = useRef(null); // Ссылка для закрытия по клику извне

    // 1. Загрузка данных с бэкенда при монтировании компонента
    useEffect(() => {
        const loadProviders = async () => {
            try {
                const response = await fetch(ApiUrl + "/api/ReturnListProvider");
                if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
                const data = await response.json();

                // Внимание: проверьте имя поля в ответе бэкенда (например, data.provider или data.providers)
                setProviders(data.provider || data.providers || data || []);
            } catch (error) {
                console.error("Ошибка загрузки поставщиков:", error);
            }
        };

        loadProviders();
    }, []);

    // 2. Фильтрация списка на основе введенного текста
    // Внимание: убедитесь, что поле называется nameProvider (если иначе — поправьте здесь и в JSX)
    const filteredProviders = providers.filter(p =>
        p.nameProvider?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Обработка выбора поставщика
    const handleSelectProvider = (guid, name) => {
        setSelectedName(name); // Отображаем имя в поле
        setSearchTerm(''); // Сбрасываем текст в поиске
        setIsOpen(false); // Закрываем выпадающий список

        // Передаем выбранный ID наверх (или вызываем вашу утилиту, если она есть)
        if (setGuidIdProvider) {
            setGuidIdProvider(guid);
        }
        // handleSelectProviderChange(guid, setGuidIdProvider, setProviderInfo, setProviderList);
    };

    // 4. Закрытие списка при клике в любое другое место экрана
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="position-relative w-100" ref={dropdownRef}>
            {/* Кастомное поле, имитирующее селект */}
            <div
                className="form-select text-start d-flex justify-content-between align-items-center"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                <span className={selectedName ? "text-dark" : "text-muted"}>
                    {selectedName || "Выберите поставщика"}
                </span>
            </div>

            {/* Окно поиска и выпадающий список */}
            {isOpen && (
                <div
                    className="position-absolute bg-white border rounded shadow mt-1 p-2 w-100"
                    style={{ zIndex: 1050 }}
                >
                    {/* Поле ввода текста */}
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Поиск поставщика..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />

                    {/* Список отфильтрованных элементов с ограничением высоты */}
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map(p => (
                                <div
                                    key={p.guidIdProvider}
                                    className="dropdown-item p-2 rounded"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelectProvider(p.guidIdProvider, p.nameProvider)}
                                >
                                    {p.nameProvider}
                                </div>
                            ))
                        ) : (
                            <div className="text-muted p-2 text-center" style={{ fontSize: '14px' }}>
                                Поставщик не найден
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderList;
