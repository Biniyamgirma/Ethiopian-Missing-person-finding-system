import react from 'react';
import { useState, useEffect } from 'react';


const CriminalPage = () =>{
    
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-slate-800 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-slate-600 to-slate-900 dark:from-slate-300 dark:via-slate-200 dark:to-slate-500 sm:text-6xl md:text-7xl">
          {t('Amhara Police Criminal Database')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('Add and manage criminals efficiently with our user-friendly interface.')}
        </p>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Add New Criminal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Criminal</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
              {/* Photo Upload and Preview Section */}
              <div className="md:col-span-1 space-y-2"> {/* Takes full width on small, half on medium+ */}
                <Label htmlFor="photoFile">Criminal Photo</Label>
                <Input
                  id="photoFile"
                  type="file"
                  name="photo"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="mb-2"
                />
                {imagePreviewUrl && (
                  <div className="mt-2 border rounded-md overflow-hidden shadow-sm w-full aspect-square max-w-xs mx-auto md:mx-0"> {/* Centered on small, left on medium+ */}
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Form fields container */}
              <div className="md:col-span-1 space-y-4"> {/* Takes full width on small, half on medium+ */}
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={newCriminal.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    placeholder="Middle Name"
                    value={newCriminal.middleName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={newCriminal.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                 <div>
                  <Label htmlFor="fileNumber">File Number</Label>
                  <Input
                    id="fileNumber"
                    name="fileNumber"
                    placeholder="File Number"
                    value={newCriminal.fileNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="policeStationId">Police Station ID</Label>
                  <Input
                    id="policeStationId"
                    name="policeStationId"
                    placeholder="Police Station ID"
                    value={newCriminal.policeStationId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            
              {/* Other attributes spread across the grid */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, faceColor: value }))} value={newCriminal.faceColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Face Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.faceColor.slice(1).map(color => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, hairColor: value }))} value={newCriminal.hairColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hair Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.hairColor.slice(1).map(color => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, height: value }))} value={newCriminal.height}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Height" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.height.slice(1).map(height => (
                      <SelectItem key={height} value={height}>
                        {height}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, bodyType: value }))} value={newCriminal.bodyType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Body Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.bodyType.slice(1).map(bodyType => (
                      <SelectItem key={bodyType} value={bodyType.toLowerCase()}>
                        {bodyType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={newCriminal.age}
                    onChange={handleInputChange}
                  />
                </div>
                <Select onValueChange={(value) => setNewCriminal(prev => ({ ...prev, gender: value }))} value={newCriminal.gender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.gender.slice(1).map(gender => (
                      <SelectItem key={gender} value={gender.toLowerCase()} >
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={handleAddCriminal}>Add Criminal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 space-y-3 z-50">
        {showSuccessToast && (
          <div className="flex items-center bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-md">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <div><p className="font-bold">Success</p><p>{successMessage}</p></div>
          </div>
        )}
        {showErrorToast && (
          <div className="flex items-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md">
            <XCircle className="h-6 w-6 text-red-500 mr-2" />
            <div><p className="font-bold">Error</p><p>{errorMessage}</p></div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <Card className="mb-8 shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
            <UserSearch className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
            {t('filterCriminalsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            type="search"
            placeholder={t('searchByNamePlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="text-base py-3 px-4 shadow-inner dark:bg-gray-700 dark:border-gray-600"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`filter-${key}`} className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                  <FilterIcon filterKey={key} />
                  {t(key.charAt(0).toUpperCase() + key.slice(1) + 'FilterLabel')}
                </Label>
                <Select
                  value={filters[key]}
                  onValueChange={(value) => handleFilterChange(key, value)}
                >
                  <SelectTrigger id={`filter-${key}`} className="w-full shadow-sm dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue placeholder={t('selectOptionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option} value={option}>
                        {t(option.toLowerCase().replace(/\s+/g, '') + 'OptionLabel', option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criminals Grid */}
      {isLoading ? (
        <div className="text-center py-12"><p className="text-xl text-gray-500 dark:text-gray-400">Loading criminals...</p></div>
      ) : fetchError ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-xl">Error loading criminals: {fetchError}</p>
          <Button onClick={fetchCriminals} className="mt-4">Try Again</Button>
        </div>
      ) : filteredCriminals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCriminals.map(criminal => (
            <Card key={criminal.criminalId || criminal.fileNumber} className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="p-0 relative">
                <img
                  src={criminal.photo ? (criminal.photo.startsWith('http') || criminal.photo.startsWith('blob:') ? criminal.photo : `http://localhost:3004/uploads/${criminal.photo}`) : 'https://placehold.co/400x300?text=No+Image'}
                  alt={`${criminal.firstName} ${criminal.lastName}`}
                  className="w-full h-64 object-cover object-center"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {criminal.firstName} {criminal.middleName} {criminal.lastName}
                </CardTitle>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {t('fileNumberLabel')}: {criminal.fileNumber}
                </p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><strong>{t('ageLabel')}:</strong> {criminal.age || 'N/A'}</p>
                  <p><strong>{t('genderLabel')}:</strong> {criminal.gender || 'N/A'}</p>
                  <p><strong>{t('heightLabel')}:</strong> {criminal.height || 'N/A'}</p>
                  <p><strong>{t('bodyTypeLabel')}:</strong> {criminal.bodyType || 'N/A'}</p>
                  <p><strong>{t('hairColorLabel')}:</strong> {criminal.hairColor || 'N/A'}</p>
                  <p><strong>{t('faceColorLabel')}:</strong> {criminal.faceColor || 'N/A'}</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600 flex justify-start items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Police Station ID: {criminal.policeStationId || 'N/A'}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <img src="/placeholder-no-results.svg" alt={t('noResultsFoundAlt')} className="mx-auto h-40 w-40 mb-4 opacity-70" />
          <p className="text-xl text-gray-500 dark:text-gray-400">{t('noCriminalsMatchFilters')}</p>
        </div>
      )}
    </div>
  );
}

export default CriminalPage;