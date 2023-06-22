import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

export type Preset = {
  _id: string;
  name: string;
  content: string;
};

type UsePresetsReturnType = {
  presets: Preset[] | [];
  addPreset: (preset: { name: string; content: string }) => void;
  deletePreset: (id: string) => void;
  updatePreset: (preset: Preset, name: string, content: string) => void;
  duplicatePreset: (id: string) => void;
}

function usePresets(update?: boolean): UsePresetsReturnType {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [trigger, updateList] = useState<boolean>(update ?? false);

  useEffect(() => {
    axios
      .get<Preset[]>(process.env.REACT_APP_API_URL + "presets/")
      .then((response) => response.data)
      .then((data) => {
        setPresets(data);
      });
  }, [trigger]);


  const addPreset = (preset: {
    name: string;
    content: string;
  }) => {
    axios
      .post<Preset>(process.env.REACT_APP_API_URL + "presets/", {
        name: preset.name,
        content: preset.content,
      })
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };

  const deletePreset = (id: string) => {
    axios
      .delete<Preset>(process.env.REACT_APP_API_URL + "presets/" + id)
      .then((response) => response.data)
      .then(() => {
        updateList(update || ((state) => !state));
      });
  };


  const updatePreset = (preset: Preset, name: string, content: string) => {
    axios
      .put(process.env.REACT_APP_API_URL + `presets/`, {
        id: preset._id,
        name: name || preset.name,
        content: content || preset.content,
      })
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  };

  const duplicatePreset = (id: string) => {
    try {
      axios
        .post<Preset>(process.env.REACT_APP_API_URL + "presets/duplicate/" + id )
        .then((response) => response.data)
        .then((data) => {
          updateList(update || ((state) => !state));
        });
    } catch (error: any) {
      return { error: error.message };
    }
  };



  return { presets, addPreset, deletePreset, updatePreset, duplicatePreset };
}

export default usePresets;
