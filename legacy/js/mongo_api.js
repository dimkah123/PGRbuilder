/**
 * MONGODB ATLAS DATA API MODULE
 * Handles saving and loading builds from the cloud.
 */

const MONGO_CONFIG = {
    // -------------------------------------------------------------------------
    // КОНФИГУРАЦИЯ API (ЗАПОЛНИТЕ ЭТИ ПОЛЯ)
    // -------------------------------------------------------------------------
    apiKey: "djnyrhkx",
    endpoint: "https://data.mongodb-api.com/app/data-65e9c0249103f902355b46ef/endpoint/data/v1",
    dataSource: "Cluster0",
    database: "pgr_builder",
    collection: "builds"
    // -------------------------------------------------------------------------
};

const MongoApi = {
    /**
     * Генерирует короткий ID из 6 символов.
     */
    generateShortId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Сохраняет новую сборку.
     * @param {Object} buildData - Объект данных сборки (будет сжат).
     * @returns {Promise<Object>} - { shortId, editToken } или ошибку.
     */
    async saveBuild(buildData) {
        if (!this.checkConfig()) return null;

        const shortId = this.generateShortId();
        const editToken = crypto.randomUUID();

        // Сжимаем данные
        const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(buildData));

        const payload = {
            collection: MONGO_CONFIG.collection,
            database: MONGO_CONFIG.database,
            dataSource: MONGO_CONFIG.dataSource,
            document: {
                shortId: shortId,
                editToken: editToken,
                data: compressedData,
                createdAt: new Date().toISOString()
            }
        };

        try {
            const response = await fetch(`${MONGO_CONFIG.endpoint}/action/insertOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': MONGO_CONFIG.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`MongoDB Error: ${response.status} ${errText}`);
            }

            const result = await response.json();
            console.log("Save Success:", result);

            // Сохраняем токен в localStorage для будущего редактирования
            this.storeEditToken(shortId, editToken);

            return { shortId, editToken };
        } catch (error) {
            console.error("MongoApi Save Error:", error);
            alert("Ошибка при сохранении в облако: " + error.message);
            throw error;
        }
    },

    /**
     * Загружает сборку по shortId.
     * @param {string} shortId 
     * @returns {Promise<Object>} - Распакованный объект сборки или null.
     */
    async loadBuild(shortId) {
        if (!this.checkConfig()) return null;

        const payload = {
            collection: MONGO_CONFIG.collection,
            database: MONGO_CONFIG.database,
            dataSource: MONGO_CONFIG.dataSource,
            filter: {
                shortId: shortId
            }
        };

        try {
            const response = await fetch(`${MONGO_CONFIG.endpoint}/action/findOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': MONGO_CONFIG.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`MongoDB Load Error: ${response.status}`);
            }

            const result = await response.json();

            if (!result.document) {
                console.warn("Document not found for ID:", shortId);
                return null;
            }

            // Распаковываем данные
            if (result.document.data) {
                const json = LZString.decompressFromEncodedURIComponent(result.document.data);
                return JSON.parse(json);
            }
            return null;

        } catch (error) {
            console.error("MongoApi Load Error:", error);
            alert("Не удалось загрузить сборку: " + error.message);
            return null;
        }
    },

    /**
     * Обновляет существующую сборку.
     * Требует совпадения editToken.
     * @param {string} shortId 
     * @param {Object} newData 
     * @returns {Promise<boolean>} - Успех операции.
     */
    async updateBuild(shortId, newData) {
        if (!this.checkConfig()) return false;

        const editToken = this.getEditToken(shortId);
        if (!editToken) {
            alert("Нет прав на редактирование этой сборки (токен не найден). Создайте новую копию.");
            return false;
        }

        const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(newData));

        const payload = {
            collection: MONGO_CONFIG.collection,
            database: MONGO_CONFIG.database,
            dataSource: MONGO_CONFIG.dataSource,
            filter: {
                shortId: shortId,
                editToken: editToken // Критически важно для безопасности
            },
            update: {
                "$set": {
                    data: compressedData,
                    updatedAt: new Date().toISOString()
                }
            }
        };

        try {
            const response = await fetch(`${MONGO_CONFIG.endpoint}/action/updateOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': MONGO_CONFIG.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`MongoDB Update Error: ${response.status}`);
            }

            const result = await response.json();

            if (result.matchedCount === 0) {
                alert("Ошибка обновления: Сборка не найдена или неверный токен редактирования.");
                return false;
            }

            console.log("Update Success:", result);
            return true;
        } catch (error) {
            console.error("MongoApi Update Error:", error);
            alert("Ошибка обновления: " + error.message);
            return false;
        }
    },

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    checkConfig() {
        if (MONGO_CONFIG.apiKey === "YOUR_API_KEY_HERE") {
            // alert("API Key MongoDB не настроен! Проверьте js/mongo_api.js");
            console.warn("API Key MongoDB не настроен! Проверьте js/mongo_api.js");
            return false; // Позволяем коду работать, но фейлить запросы, если ключа нет
        }
        return true;
    },

    storeEditToken(shortId, token) {
        try {
            const tokens = JSON.parse(localStorage.getItem('pgr_build_tokens') || '{}');
            tokens[shortId] = token;
            localStorage.setItem('pgr_build_tokens', JSON.stringify(tokens));
        } catch (e) {
            console.error("LocalStorage Error:", e);
        }
    },

    getEditToken(shortId) {
        try {
            const tokens = JSON.parse(localStorage.getItem('pgr_build_tokens') || '{}');
            return tokens[shortId];
        } catch (e) {
            return null;
        }
    }
};

// Экспорт в глобальную область видимости
window.MongoApi = MongoApi;
