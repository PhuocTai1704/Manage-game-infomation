import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { gameAPI, categoryAPI } from "../../services/api";
import { useEffect, useState } from "react";

interface GameFormData {
  gameId?: number; // để truyền khi update
  keyId: string;
  categoryId: number;
  defaultLanguage: string;
  gameNames: {
    language: string;
    value: string;
  }[];
}

interface Category {
  categoryId: number;
  name: string;
}

interface CategoryOption {
  value: number;
  label: string;
}

// Schema validation
const schema = yup.object().shape({
  keyId: yup.string().required("Key ID is required"),
  categoryId: yup
    .number()
    .required("Category is required")
    .min(1, "Category is required"),
  defaultLanguage: yup.string().required("Default language is required"),
  gameNames: yup
    .array()
    .of(
      yup.object().shape({
        language: yup.string().required("Language is required"),
        value: yup
          .string()
          .required("Game name is required")
          .trim() // Loại bỏ khoảng trắng đầu cuối
          .min(1, "Game name cannot be empty")
          .max(100, "Game name is too long"), // Giới hạn độ dài
      })
    )
    .min(1, "At least one game name is required")
    .max(3, "Maximum 3 game names allowed")
    .test(
      "no-empty-names",
      "All game names must have values",
      function (value) {
        if (!value) return false;
        return value.every((gameName, index) => {
          const trimmedValue = gameName.value?.trim();
          return trimmedValue && trimmedValue.length > 0;
        });
      }
    ),
});

const GameForm = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"add" | "update">("add");
  const [customKeyId, setCustomKeyId] = useState("");

  // Tự động detect URL params và set mode
  useEffect(() => {
    const hasId = urlId || id;

    if (hasId) {
      setMode("update");
    } else {
      setMode("add");
    }
  }, [urlId, id]);

  // Hàm chuyển đổi mode
  const handleModeChange = (newMode: "add" | "update") => {
    setMode(newMode);

    if (newMode === "add") {
      navigate(location.pathname, { replace: true });

      reset({
        keyId: "",
        categoryId: 0,
        defaultLanguage: "EN",
        gameNames: [{ language: "EN", value: "" }],
      });
      setCustomKeyId("");
    } else {
      if (urlId || id) {
        fetchGame();
      }
    }
  };

  // Fetch data
  useEffect(() => {
    fetchCategories();

    if ((urlId || id) && mode === "update") {
      fetchGame();
    }
  }, [urlId, id, mode]);

  // Reset form khi URL thay đổi
  useEffect(() => {
    setCustomKeyId("");
    if (!urlId && !id) {
      reset({
        keyId: "",
        categoryId: 0,
        defaultLanguage: "EN",
        gameNames: [{ language: "EN", value: "" }],
      });
    }
  }, [urlId, id]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<GameFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      keyId: "",
      categoryId: 0,
      defaultLanguage: "EN",
      gameNames: [{ language: "EN", value: "" }],
    },
  });

  const watchedGameNames = watch("gameNames");

  useEffect(() => {
    // Reset customKeyId khi id thay đổi (chuyển giữa add/update)
    setCustomKeyId("");
    if (urlId) {
      fetchGame();
    } else {
      reset({
        keyId: "",
        categoryId: 0,
        defaultLanguage: "EN",
        gameNames: [{ language: "EN", value: "" }],
      });
    }
  }, [urlId]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(0, 1000, "name", "asc");
      setCategories(response.content);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    }
  };

  // Hàm load options cho AsyncSelect - chỉ dùng khi edit mode
  const loadKeyIdOptions = async (inputValue: string) => {
    try {
      const response = await gameAPI.getAll(0, 1000, "keyId", "asc", {
        keyId: inputValue,
      });
      if (!response || !response.content) return [];
      const keyIds = [
        ...new Set(
          response.content.map((game: any) => game.keyId).filter(Boolean)
        ),
      ];
      return keyIds.map((keyId: string) => ({
        value: keyId,
        label: keyId,
      }));
    } catch {
      return [];
    }
  };

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getById(Number(urlId || id));

      // Chuyển đổi cấu trúc dữ liệu để phù hợp với form
      const formData = {
        ...response,
        categoryId: response.category?.categoryId || 0, // Chuyển category.categoryId thành categoryId
      };

      reset(formData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch game");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: GameFormData) => {
    try {
      setLoading(true);
      setError("");

      // Validate khi submit
      const hasEmptyNames = data.gameNames.some(
        (name) => !name.value || name.value.trim().length === 0
      );
      if (hasEmptyNames) {
        setError("All game names must have values");
        return;
      }

      // Validate that default language has a corresponding game name
      const hasDefaultLanguageName = data.gameNames.some(
        (name) => name.language === data.defaultLanguage
      );
      if (!hasDefaultLanguageName) {
        setError("Default language must have a corresponding game name");
        return;
      }

      // Validate game names length
      const hasLongNames = data.gameNames.some(
        (name) => name.value && name.value.length > 100
      );
      if (hasLongNames) {
        setError("Game names cannot exceed 100 characters");
        return;
      }

      if (mode === "add") {
        await gameAPI.create(data);
      } else {
        if (!data.gameId) {
          setError("Missing gameId for update");
          return;
        }
        await gameAPI.update(data.gameId, data);
      }

      navigate("/games");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save game");
    } finally {
      setLoading(false);
    }
  };

  const addGameName = () => {
    const currentGameNames = watchedGameNames || [];
    if (currentGameNames.length >= 3) {
      setError("Maximum 3 game names allowed");
      return;
    }

    // BỎ validation empty names
    const usedLanguages = currentGameNames.map((name) => name.language);
    const availableLanguages = languageOptions.filter(
      (option) => !usedLanguages.includes(option.value)
    );

    if (availableLanguages.length === 0) {
      setError("All languages have been used");
      return;
    }

    setValue("gameNames", [
      ...currentGameNames,
      { language: availableLanguages[0].value, value: "" },
    ]);
    setError("");
  };

  const removeGameName = (index: number) => {
    const currentGameNames = watchedGameNames || [];
    if (currentGameNames.length <= 1) {
      setError("At least one game name is required");
      return;
    }
    const updatedGameNames = currentGameNames.filter((_, i) => i !== index);
    setValue("gameNames", updatedGameNames);
    setError(""); // Clear any previous errors
  };

  const updateGameName = (
    index: number,
    field: "language" | "value",
    value: string
  ) => {
    const currentGameNames = watchedGameNames || [];
    const updatedGameNames = [...currentGameNames];

    if (field === "language") {
      // Chỉ check duplicate language
      const isLanguageUsed = currentGameNames.some(
        (name, i) => i !== index && name.language === value
      );

      if (isLanguageUsed) {
        setError("This language is already selected");
        return;
      }
    }

    // BỎ validation cho value - cho phép user xóa/sửa tự do
    updatedGameNames[index] = { ...updatedGameNames[index], [field]: value };
    setValue("gameNames", updatedGameNames);
    setError(""); // Clear any previous errors
  };

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    value: category.categoryId,
    label: category.name,
  }));

  const languageOptions = [
    { value: "EN", label: "English" },
    { value: "KO", label: "Korean" },
    { value: "JA", label: "Japanese" },
  ];

  // Hàm xử lý khi chọn keyId từ AsyncSelect (chỉ dùng trong edit mode)
  const handleKeyIdChange = async (option: any, field: any) => {
    const keyId = option?.value || "";
    field.onChange(keyId);
    if (keyId) {
      const response = await gameAPI.getAll(0, 1, "keyId", "asc", { keyId });
      if (response.content && response.content.length > 0) {
        const game = response.content[0];

        // Cập nhật state và URL
        // setCurrentGameId(game.gameId); // This state is removed
        // setUrlId(game.gameId); // This function is removed

        // Reset form với data mới
        reset({
          gameId: game.gameId,
          keyId: game.keyId,
          categoryId: game.category?.categoryId || 0,
          defaultLanguage: game.defaultLanguage,
          gameNames: game.gameNames.map((g: any) => ({
            language: g.language,
            value: g.value,
          })),
        });
      }
    }
  };

  // Hàm thêm ID vào URL
  const setUrlId = (gameId: number) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("id", gameId.toString());

    window.history.replaceState(
      null,
      "",
      `${location.pathname}?${newSearchParams.toString()}`
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">{mode === "add" ? "Add Game" : "Edit Game"}</h2>
        <div className="btn-group mb-4" role="group" aria-label="Mode toggle">
          <button
            type="button"
            className={`btn mode-toggle-btn ${
              mode === "add" ? "btn-primary active" : "btn-outline-primary"
            }`}
            onClick={() => handleModeChange("add")}
          >
            Add
          </button>
          <button
            type="button"
            className={`btn mode-toggle-btn ${
              mode === "update" ? "btn-primary active" : "btn-outline-primary"
            }`}
            onClick={() => handleModeChange("update")}
          >
            Edit
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card shadow p-4">
        <form
          onSubmit={handleSubmit((data) => {
            // Logic xử lý keyId khi submit:
            // - Nếu đang update mode và có nhập customKeyId thì dùng customKeyId
            // - Ngược lại dùng keyId từ form
            const submitData = {
              ...data,
              keyId:
                mode === "update" && customKeyId.trim()
                  ? customKeyId.trim()
                  : data.keyId,
            };
            onSubmit(submitData);
          })}
        >
          {/* Key ID Field */}
          <div className="mb-3">
            <label className="form-label">Key ID *</label>
            <Controller
              name="keyId"
              control={control}
              render={({ field }) =>
                mode === "update" ? ( // Dựa vào mode thay vì isEditMode
                  <>
                    {/* 
                      UPDATE MODE: 
                      - Hiển thị AsyncSelect để chọn keyId có sẵn từ database
                      - Cho phép search và select keyId đã tồn tại
                      - Tự động load thông tin game khi chọn keyId
                    */}
                    <AsyncSelect
                      {...field}
                      loadOptions={loadKeyIdOptions}
                      isClearable
                      isSearchable
                      placeholder="Search and select existing Key ID..."
                      noOptionsMessage={() => "No Key IDs found"}
                      loadingMessage={() => "Loading..."}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      cacheOptions
                      defaultOptions
                      onChange={(option) => handleKeyIdChange(option, field)}
                      value={
                        field.value
                          ? { value: field.value, label: field.value }
                          : null
                      }
                    />
                    <div className="mt-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Or enter new Key ID to change..."
                        value={customKeyId}
                        onChange={(e) => setCustomKeyId(e.target.value)}
                      />
                      <small className="text-muted">
                        Leave blank to keep current Key ID.
                      </small>
                    </div>
                  </>
                ) : (
                  /* 
                    ADD MODE: 
                    - Chỉ hiển thị input thường để nhập keyId mới
                    - Không cần AsyncSelect vì đang tạo game mới
                  */
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter new Key ID..."
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )
              }
            />
            {errors.keyId && (
              <div className="text-danger mt-1">{errors.keyId.message}</div>
            )}
          </div>

          {/* Category and Default Language - Same Row */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Category *</label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={categoryOptions}
                    placeholder="Select a category"
                    isClearable
                    onChange={(option) => field.onChange(option?.value || 0)}
                    value={
                      categoryOptions.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                  />
                )}
              />
              {errors.categoryId && (
                <div className="text-danger mt-1">
                  {errors.categoryId.message}
                </div>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">Default Language *</label>
              <Controller
                name="defaultLanguage"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={languageOptions}
                    placeholder="Select default language"
                    onChange={(option) => field.onChange(option?.value || "EN")}
                    value={
                      languageOptions.find(
                        (option) => option.value === field.value
                      ) || null
                    }
                  />
                )}
              />
              {errors.defaultLanguage && (
                <div className="text-danger mt-1">
                  {errors.defaultLanguage.message}
                </div>
              )}
            </div>
          </div>

          {/* Game Names */}
          <div className="mb-3">
            <label className="form-label">Game Names *</label>
            {watchedGameNames?.map((gameName, index) => (
              <div key={index} className="d-flex mb-2">
                <div className="me-2" style={{ width: "150px" }}>
                  <Select
                    value={
                      languageOptions.find(
                        (option) => option.value === gameName.language
                      ) || null
                    }
                    options={languageOptions.filter((option) => {
                      const usedLanguages =
                        watchedGameNames
                          ?.filter((_, i) => i !== index)
                          .map((name) => name.language) || [];
                      return !usedLanguages.includes(option.value);
                    })}
                    onChange={(option) =>
                      updateGameName(index, "language", option?.value || "EN")
                    }
                    placeholder="Language"
                  />
                </div>
                <div className="flex-grow-1 me-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Game Name *"
                    value={gameName.value}
                    onChange={(e) =>
                      updateGameName(index, "value", e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeGameName(index)}
                  disabled={watchedGameNames.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            {errors.gameNames && (
              <div className="text-danger mt-2">{errors.gameNames.message}</div>
            )}
            <button
              type="button"
              className="btn btn-secondary my-3"
              onClick={addGameName}
              disabled={watchedGameNames && watchedGameNames.length >= 3}
            >
              Add Game Name
            </button>
          </div>

          {/* Submit Button */}
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/games")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameForm;
