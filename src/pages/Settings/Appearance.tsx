import useThemeState from "../../hooks/useThemeState";

function Appearance() {
  const { currentTheme, themeMode, setThemeMode, setTheme } = useThemeState();

  function toggleThemeMode(event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (!name) return;
    if (name === "sync") {
      return setThemeMode(value);
    }
    setThemeMode("manual");
    setTheme(name);
  }

  return (
    <div>
      <div className="section">
        <h1 className="section-name">Appearance</h1>
        <p className="text-gray">Customize your experience with the app</p>
      </div>

      <div className="overview">
        <p>
          Here, you have the ability to customize the way the app looks to you. You can choose from a variety of themes
          that suit your style and preferences.
        </p>
      </div>

      <h3 className="header-3 margin-block-large">Theme Mode</h3>
      <div className=" margin-block-large">
        <select className="form-control form-select" name="sync" onChange={toggleThemeMode} value={themeMode}>
          <option value="sync">Sync with System</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <div className="divider-block margin-block-large muted" />
      <div className="modes" aria-disabled={themeMode === "sync"}>
        <h3 className="header-3 margin-block-large">Theme</h3>
        <div className="mode-grid" >
          <label htmlFor="manual-light">
            <div className="window"
              data-theme={'light'}
              aria-checked={themeMode === "manual" && currentTheme === "light"}>
              <div className="window-header">
                <div className="window-title">         <input
                  type="checkbox"
                  id="manual-light"
                  name="light"
                  className="margin-inline-medium"
                  onChange={toggleThemeMode}
                  checked={themeMode === "manual" && currentTheme === "light"}
                />Light</div>
                <div className="window-controls">
                  <button className="window-minimize" />
                  <button className="window-maximize" />
                  <button className="window-close" />
                </div>
              </div>
              <div className="window-content" />
            </div>
          </label>


          <label htmlFor="manual-dark">
            <div className="window"
              data-theme={'dark'}
              aria-checked={themeMode === "manual" && currentTheme === "dark"}>
              <div className="window-header">
                <div className="window-title">         <input
                  type="checkbox"
                  id="manual-dark"
                  name="dark"
                  className="margin-inline-medium"
                  onChange={toggleThemeMode}
                  checked={themeMode === "manual" && currentTheme === "dark"}
                />Dark</div>
                <div className="window-controls">
                  <button className="window-minimize" />
                  <button className="window-maximize" />
                  <button className="window-close" />
                </div>
              </div>
              <div className="window-content" />
            </div>
          </label>

          <label htmlFor="manual-night">
            <div className="window"
              data-theme={'night'}
              aria-checked={themeMode === "manual" && currentTheme === "night"}>
              <div className="window-header">
                <div className="window-title">
                  <input
                    type="checkbox"
                    id="manual-night"
                    name="night"
                    className="margin-inline-medium"
                    onChange={toggleThemeMode}
                    checked={themeMode === "manual" && currentTheme === "night"}
                  />Night</div>
                <div className="window-controls">
                  <button className="window-minimize" />
                  <button className="window-maximize" />
                  <button className="window-close" />
                </div>
              </div>
              <div className="window-content" />
            </div>
          </label>

          <label htmlFor="manual-coffee">
            <div className="window"
              data-theme={'coffee'}
              aria-checked={themeMode === "manual" && currentTheme === "coffee"}>
              <div className="window-header">
                <div className="window-title">
                  <input
                    type="checkbox"
                    id="manual-coffee"
                    name="coffee"
                    className="margin-inline-medium"
                    onChange={toggleThemeMode}
                    checked={themeMode === "manual" && currentTheme === "coffee"}
                  />Coffee</div>
                <div className="window-controls">
                  <button className="window-minimize" />
                  <button className="window-maximize" />
                  <button className="window-close" />
                </div>
              </div>
              <div className="window-content" />
            </div>
          </label>
         
        </div>
      </div >
    </div >

  );
}

export default Appearance;
