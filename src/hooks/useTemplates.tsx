import axios from "axios";
import { useState } from "react";
import { useAlert } from "../components/Alert";
import { Product, Template } from "../types";

function useTemplate() {
  const [templates, setTemplates] = useState([]);
  const { addAlert } = useAlert();

  const getTemplatesByProduct = (product: Product['name']) => {
    axios
      .get(process.env.REACT_APP_API_URL + `templates/template/product/${product}`)
      .then((response) => response.data)
      .then((data) => {
        setTemplates(data);
      });
  };

  const addTemplate = (item: Template) => {
    axios
      .post(process.env.REACT_APP_API_URL + "templates/template", item)
      .then((response) => response.data)
      .then((data) => {
        getTemplatesByProduct(item.product);
      }).catch((err) => {
        throw new Error(err);
      });

  };

  const deleteTemplate = (template: Template) => {
    axios
      .delete(process.env.REACT_APP_API_URL + "templates/template/" + template._id)
      .then((response) => response.data)
      .then((data) => {
        getTemplatesByProduct(template.product);
      });
  };

  const updateTemplate = (old: Template, newT: Template) => {
    const id = old._id;
    if (!id) {
      return null
    }
    const newTemplate = {
      product: newT.product ?? old.product,
      name: newT.name ?? old.name,
      workflows: newT.workflows ?? old.workflows,
    };

    axios
      .put(process.env.REACT_APP_API_URL + "/templates/template/" + old._id, newTemplate)
      .then((response) => response.data)
      .then(() => {
        getTemplatesByProduct(old.product);
      });
  };

  const duplicateTemplate = (template: Template) => {
    try {
      axios
        .post(process.env.REACT_APP_API_URL + "templates/template/duplicate/" + template._id)
        .then((response) => response.data)
        .then((data) => {
          getTemplatesByProduct(template.product);
        });
    } catch (error) {
      return addAlert({
        message: "Error duplicating template",
      });
    }
  };

  return {
    templates, getTemplatesByProduct, addTemplate, duplicateTemplate, updateTemplate, deleteTemplate
  };
}

export default useTemplate;
