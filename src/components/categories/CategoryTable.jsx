import { useState, useEffect } from "react";
import { Edit, Search, Trash2, Plus, ChevronDown, ChevronRight, FolderPlus } from "lucide-react";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const CategoryTable = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ name: "", description: "" });
  const [editCategoryData, setEditCategoryData] = useState({ id: null, name: "", description: "" });
  const [newSubcategoryData, setNewSubcategoryData] = useState({ 
    name: "", 
    description: "", 
    categoryId: null 
  });
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [isEditSubcategoryModalOpen, setIsEditSubcategoryModalOpen] = useState(false);
  const [editSubcategoryData, setEditSubcategoryData] = useState({
    id: null,
    categoryId: null,
    name: "",
    description: ""
  });

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    axios.defaults.withCredentials = true;
    
    let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    if (!csrfToken) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN' || name === 'csrftoken' || name === '_csrf') {
          csrfToken = decodeURIComponent(value);
          break;
        }
      }
    }
    
    if (csrfToken) {
      axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
      axios.defaults.headers.common['X-XSRF-TOKEN'] = csrfToken;
      axios.defaults.headers.common['CSRF-Token'] = csrfToken;
      axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
    }
    
    axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
    axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/`);
      
      const categoriesWithSubcategories = await Promise.all(
        response.data.map(async (category) => {
          try {
            const subcategoriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/${category.id}/subcategories/`);
            return {
              ...category,
              subcategories: subcategoriesResponse.data
            };
          } catch (err) {
            console.error(`Failed to fetch subcategories for category ${category.id}:`, err);
            return {
              ...category,
              subcategories: []
            };
          }
        })
      );
      
      setCategories(categoriesWithSubcategories);
      setFilteredCategories(categoriesWithSubcategories);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(`Failed to load categories: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) => 
          category.name.toLowerCase().includes(term) || 
          category.description?.toLowerCase().includes(term) ||
          category.subcategories.some(subcat => 
            subcat.name.toLowerCase().includes(term) || 
            subcat.description?.toLowerCase().includes(term)
          )
      );
      setFilteredCategories(filtered);
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryData.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setError(null);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/categories/`, newCategoryData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const newCategory = { ...response.data, subcategories: [] };
      setCategories([...categories, newCategory]);
      setFilteredCategories([...categories, newCategory]);
      setNewCategoryData({ name: "", description: "" });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to add category:", err);
      setError(`Failed to add category: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryData.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      setError(null);
      
      await axios.put(`${import.meta.env.VITE_API_URL}/api/categories/${editCategoryData.id}/`, {
        name: editCategoryData.name,
        description: editCategoryData.description
      });
      
      const updatedCategories = categories.map(category => {
        if (category.id === editCategoryData.id) {
          return {
            ...category,
            name: editCategoryData.name,
            description: editCategoryData.description
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update category:", err);
      setError(`Failed to update category: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    
    if (category && category.subcategories.length > 0) {
      setError("Cannot delete a category with subcategories. Please delete the subcategories first.");
      return;
    }
    
    try {
      setError(null);
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}/`);
      
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError(`Failed to delete category: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleAddSubcategory = async () => {
	if (!newSubcategoryData.name.trim()) {
	  setError("Subcategory name is required");
	  return;
	}
	
	try {
	  setError(null);
	  
	  const subcategoryPayload = {
		name: newSubcategoryData.name,
		description: newSubcategoryData.description,
		category: newSubcategoryData.categoryId,
		is_active: true
	  };
	  
	  const response = await axios.post(
		`${import.meta.env.VITE_API_URL}/api/subcategories/`, 
		subcategoryPayload,
		{
		  headers: {
			'Content-Type': 'application/json',
		  }
		}
	  );
	  
	  updateCategoriesWithNewSubcategory(response.data);
	} catch (err) {
	  console.error("Failed to add subcategory:", err);
	  
	  try {
		console.log("First endpoint failed, trying direct subcategories endpoint...");
		
		const subcategoryPayload = {
		  name: newSubcategoryData.name,
		  description: newSubcategoryData.description,
		  category: newSubcategoryData.categoryId,
		  is_active: true
		};
		
		const response = await axios.post(
		  `${import.meta.env.VITE_API_URL}/api/subcategories/`, 
		  subcategoryPayload,
		  {
			headers: {
			  'Content-Type': 'application/json',
			}
		  }
		);
		
		updateCategoriesWithNewSubcategory(response.data);
	  } catch (fallbackErr) {
		let errorMessage = "Failed to add subcategory";
		if (fallbackErr.response?.data?.detail) {
		  errorMessage += `: ${fallbackErr.response.data.detail}`;
		} else if (fallbackErr.response?.data?.error) {
		  errorMessage += `: ${fallbackErr.response.data.error}`;
		} else if (fallbackErr.message) {
		  errorMessage += `: ${fallbackErr.message}`;
		}
		
		if (fallbackErr.response?.status) {
		  errorMessage += ` (Status: ${fallbackErr.response.status})`;
		}
		
		setError(errorMessage);
	  }
	}
  };
  
  const updateCategoriesWithNewSubcategory = (newSubcategory) => {
    const updatedCategories = categories.map(category => {
      if (category.id === newSubcategoryData.categoryId) {
        return {
          ...category,
          subcategories: [...category.subcategories, newSubcategory]
        };
      }
      return category;
    });
    
    setCategories(updatedCategories);
    setFilteredCategories(updatedCategories);
    setNewSubcategoryData({ name: "", description: "", categoryId: null });
    setIsAddSubcategoryModalOpen(false);
  };

  const handleEditSubcategory = async () => {
    if (!editSubcategoryData.name.trim()) {
      setError("Subcategory name is required");
      return;
    }
    
    try {
      setError(null);
      
      await axios.put(`${import.meta.env.VITE_API_URL}/api/subcategories/${editSubcategoryData.id}/`, {
        name: editSubcategoryData.name,
        description: editSubcategoryData.description
      });
      
      const updatedCategories = categories.map(category => {
        if (category.id === editSubcategoryData.categoryId) {
          return {
            ...category,
            subcategories: category.subcategories.map(subcategory => {
              if (subcategory.id === editSubcategoryData.id) {
                return {
                  ...subcategory,
                  name: editSubcategoryData.name,
                  description: editSubcategoryData.description
                };
              }
              return subcategory;
            })
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
      setIsEditSubcategoryModalOpen(false);
    } catch (err) {
      console.error("Failed to update subcategory:", err);
      setError(`Failed to update subcategory: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId, categoryId) => {
    try {
      setError(null);
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/subcategories/${subcategoryId}/`);
      
      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: category.subcategories.filter(
              subcategory => subcategory.id !== subcategoryId
            )
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories);
    } catch (err) {
      console.error("Failed to delete subcategory:", err);
      setError(`Failed to delete subcategory: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (loading) return <div className="text-center py-6">{t('common.loading')}</div>;

  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 border border-gray-200 mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <button 
            className="underline text-red-800 mt-1"
            onClick={() => setError(null)}
          >
            {t('common.dismiss')}
          </button>
        </div>
      )}
      
      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center mb-6`}>
        <h2 className="text-xl font-semibold text-gray-800">{t('categoriestable.title')}</h2>
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-4`}>
          <div className="relative">
            <input
              type="text"
              placeholder={t('categoriestable.searchPlaceholder')}
              className={`bg-gray-100 text-gray-800 rounded-lg ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-500`} size={18} />
          </div>
          <button 
            className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            {t('categoriestable.addCategory')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('categoriestable.name')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('categoriestable.description')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('categoriestable.subcategories')}
              </th>
              <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('categoriestable.actions')}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <>
                  <tr key={`category-${category.id}`} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-2`}>
                        <button 
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          {expandedCategories[category.id] ? 
                            <ChevronDown size={16} /> : 
                            <ChevronRight size={16} className={isRTL ? 'transform rotate-180' : ''} />
                          }
                        </button>
                        {category.name}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {category.description || "-"}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {category.subcategories.length}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setNewSubcategoryData({ ...newSubcategoryData, categoryId: category.id });
                            setIsAddSubcategoryModalOpen(true);
                          }}
                        >
                          <FolderPlus size={18} title={t('categoriestable.addSubcategory')} />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setEditCategoryData({
                              id: category.id,
                              name: category.name,
                              description: category.description || ""
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit size={18} title={t('categoriestable.editCategory')} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 size={18} title={t('categoriestable.deleteCategory')} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Subcategories */}
                  {expandedCategories[category.id] && category.subcategories.map(subcategory => (
                    <tr key={`subcategory-${subcategory.id}`} className="bg-gray-50">
                      <td className={`px-6 py-3 whitespace-nowrap text-sm text-gray-700 ${isRTL ? 'pr-14 text-right' : 'pl-14 text-left'}`}>
                        {isRTL ? '↳ ' : '↳ '}{subcategory.name}
                      </td>
                      <td className={`px-6 py-3 text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {subcategory.description || "-"}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        -
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => {
                              setEditSubcategoryData({
                                id: subcategory.id,
                                categoryId: category.id,
                                name: subcategory.name,
                                description: subcategory.description || ""
                              });
                              setIsEditSubcategoryModalOpen(true);
                            }}
                          >
                            <Edit size={18} title={t('categoriestable.editSubcategory')} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteSubcategory(subcategory.id, category.id)}
                          >
                            <Trash2 size={18} title={t('categoriestable.deleteSubcategory')} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={`px-6 py-4 text-center text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {searchTerm ? t('categoriestable.noMatch') : t('categoriestable.noCategories')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-semibold mb-4 text-black">{t('categoriestable.addNewCategory')}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.name')}</label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.description')}</label>
              <textarea
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
              ></textarea>
            </div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-2`}>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsAddModalOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                onClick={handleAddCategory}
              >
                {t('categoriestable.addCategory')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-semibold mb-4 text-black">{t('categoriestable.editCategory')}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.name')}</label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                value={editCategoryData.name}
                onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.description')}</label>
              <textarea
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                value={editCategoryData.description}
                onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
              ></textarea>
            </div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-2`}>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsEditModalOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                onClick={handleEditCategory}
              >
                {t('common.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isAddSubcategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-semibold mb-4 text-black">
              {t('categoriestable.addNewSubcategoryTo')} {categories.find(c => c.id === newSubcategoryData.categoryId)?.name}
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.name')}</label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                value={newSubcategoryData.name}
                onChange={(e) => setNewSubcategoryData({ ...newSubcategoryData, name: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.description')}</label>
              <textarea
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                value={newSubcategoryData.description}
                onChange={(e) => setNewSubcategoryData({ ...newSubcategoryData, description: e.target.value })}
              ></textarea>
            </div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-2`}>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setIsAddSubcategoryModalOpen(false);
                  setError(null);
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                onClick={handleAddSubcategory}
              >
                {t('categoriestable.addSubcategory')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {isEditSubcategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-full max-w-md ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="text-lg font-semibold mb-4 text-black">{t('categoriestable.editSubcategory')}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.name')}</label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                value={editSubcategoryData.name}
                onChange={(e) => setEditSubcategoryData({ ...editSubcategoryData, name: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoriestable.description')}</label>
              <textarea
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                value={editSubcategoryData.description}
                onChange={(e) => setEditSubcategoryData({ ...editSubcategoryData, description: e.target.value })}
              ></textarea>
            </div>
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-end gap-2`}>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsEditSubcategoryModalOpen(false)}
              >
                {t('common.cancel')}
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                onClick={handleEditSubcategory}
              >
                {t('common.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;
