class Group {
  constructor({
    title,
    description,
    position,
    department,
    members,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.title = title;
    this.description = description;
    this.position = position;
    this.department = department;
    this.members = members.map(member => ({
      employeeId: member.employeeId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      // profileImage: member.profileImage || '', // Ensure profileImage is saved as a string
      position: member.position || null,
      department: member.department || null,
    }));
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toFirestore() {
    return {
      title: this.title,
      description: this.description,
      position: this.position,
      department: this.department,
      members: this.members,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Group({
      id: snapshot.id,
      title: data.title,
      description: data.description,
      position: data.position,
      department: data.department,
      members: data.members,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

module.exports = Group;