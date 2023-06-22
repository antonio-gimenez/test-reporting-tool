import axios from "axios";
import { memo, useEffect, useState } from "react";
import { ReactComponent as PlusIcon } from "../assets/icons/plus-16.svg";
import { ReactComponent as TrashIcon } from "../assets/icons/trash-16.svg";
import { Test } from "../types";
import { downloadFile, getAttachments, humanFileSize } from "../utils/file";
import { useAlert } from "./Alert";

type TestAttachmentsProps = {
  test: Test | null;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function Attachments({ test }: TestAttachmentsProps) {
  const [testFiles, setTestFiles] = useState<
    {
      _id: string;
      name: string;
      size: number;
    }[]
  >([]);

  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [isRemovingFile, setIsRemovingFile] = useState(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (!test?._id) return;
    setIsLoadingAttachments(true);
    const loadAttachments = async () => {
      setIsLoadingAttachments(true);
      if (test._id && test.files && test.files.length > 0) {
        const attachments = await getAttachments(test._id);
        setTestFiles(attachments);
      }
      setIsLoadingAttachments(false);
    };

    loadAttachments();
  }, [test?.files?.length]);
  const removeFile = async ({ testId, fileId }: { testId: string; fileId: string }) => {
    setIsRemovingFile(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tests/files/${testId}/${fileId}`);
      const newTestFiles = await getAttachments(testId);
      setTestFiles(newTestFiles);
    } catch (error: any) {
      addAlert({ message: error?.message });
    }
    setIsRemovingFile(false);
  };

  const usedFileSize = testFiles?.length > 0 ? testFiles?.reduce((acc, file) => acc + file.size, 0) : 0;

  const uploadFilesToTest = async (files: FileList | null) => {
    if (!test) return;
    if (!files) return;

    const isMultipleFiles = files instanceof FileList;
    const fileList = isMultipleFiles ? Array.from(files) : [files];

    if (fileList.length > 10)
      return addAlert({ message: "You can only upload up to 10 files at a time.", position: "top-center" });

    const fileListSize = fileList.reduce((acc, file) => acc + file.size, 0);

    if (fileListSize > MAX_FILE_SIZE)
      return addAlert({ message: "File or files are too large.", position: "top-center" });
    if (fileListSize + usedFileSize > MAX_FILE_SIZE)
      return addAlert({ message: "File or files are too large.", position: "top-center" });
    // Remove the files that exceed the limits from fileList
    setIsLoadingAttachments(true);
    try {
      const formData = new FormData();
      fileList.forEach((file) => formData.append("files", file));
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/tests/files/${test._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      addAlert({ message: response.data.message, position: "top-center" });
      const newTestFiles = await getAttachments(test._id);
      setTestFiles(newTestFiles);
    } catch (error: any) {
      addAlert({ message: error.message, position: "top-center" });
    }
    setIsLoadingAttachments(false);
  };

  if (!test) return null;

  return (
    <div className="workflow margin-block-large">
      {isLoadingAttachments ? (
        <div className="loading">Loading attachments...</div>
      ) : (
        <>
          {!isLoadingAttachments && (
            <div className="flex-row-center-gap between">
              <label htmlFor="file-input">
                <span className="btn btn-secondary">
                  <PlusIcon />
                  Add attachment
                </span>
                <input
                  className="form-control-hidden"
                  id={"file-input"}
                  type="file"
                  multiple
                  onChange={(e) => uploadFilesToTest(e.target.files)}
                />
              </label>
              <div className="flex-row-center-gap text-small content-muted">
                <p>
                  {humanFileSize(usedFileSize)} / {humanFileSize(MAX_FILE_SIZE)}
                </p>
                <progress value={usedFileSize} max={MAX_FILE_SIZE} />
              </div>
            </div>
          )}

          {testFiles?.length > 0 && (
            <ul className="box margin-block-medium">
              {testFiles?.map((file) => (
                <div key={file._id} className=" list-item">
                  <button className="link link-secondary truncate" title={file.name} onClick={() => downloadFile(file)}>
                    {file.name}
                  </button>

                  <div className="flex-row-center-gap" aria-disabled={isRemovingFile}>
                    <span className="content-muted text-small">{humanFileSize(file.size)}</span>
                    <TrashIcon
                      className="btn-icon hover-error"
                      aria-disabled={isRemovingFile}
                      onClick={() => removeFile({ testId: test._id, fileId: file._id })}
                    />
                  </div>
                </div>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default memo(Attachments);
